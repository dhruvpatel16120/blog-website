import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { emailTemplates, getPlatformName, getPlatformUrl } from '@/lib/email-templates';
import { generateCustomAvatarUrl } from '@/lib/utils';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    console.log('🔐 Invite user request received');
    
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      console.log('❌ Unauthorized request - no session or insufficient role');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`👤 Session user: ${session.user?.email || session.user?.username}, Role: ${session.user?.role}`);

    const { fullName, email, role, customMessage } = await request.json();
    console.log(`📝 Invite request: ${fullName} (${email}) as ${role}`);

    // Validate input
    if (!fullName?.trim() || !email?.trim() || !role) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate role - only USER and ADMIN allowed
    const validRoles = ['USER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      console.log('❌ Invalid role specified:', role);
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Role restrictions - only ADMIN users can invite ADMIN users
    if (role === 'ADMIN' && session.user?.role !== 'ADMIN') {
      console.log('❌ Insufficient privileges to invite admin user');
      return NextResponse.json({ error: 'Insufficient privileges to invite admin user' }, { status: 403 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      console.log(`ℹ️  User already exists: ${existingUser.id}`);
      // Update existing user's role if different
      if (existingUser.role !== role) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role }
        });
        console.log(`✅ Updated existing user role from ${existingUser.role} to ${role}`);
      }
      return NextResponse.json({ 
        message: 'User already exists, role updated if needed',
        user: existingUser
      });
    }

    // Generate unique username
    let username = email.split('@')[0];
    let counter = 1;
    let finalUsername = username;
    
    while (true) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: finalUsername }
      });
      if (!existingUsername) break;
      finalUsername = `${username}${counter}`;
      counter++;
    }
    
    console.log(`👤 Generated username: ${finalUsername}`);

    // Create new user with temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Generate automatic avatar URL
    const avatarUrl = generateCustomAvatarUrl(fullName.trim(), finalUsername);

    const user = await prisma.user.create({
      data: {
        username: finalUsername,
        email: email.toLowerCase(),
        fullName: fullName.trim(),
        password: hashedPassword,
        role,
        isActive: true,
        emailVerified: null,
        avatar: avatarUrl
      }
    });
    
    console.log(`✅ User created: ${user.id}`);

    // Generate verification token
    const token = Math.random().toString(36).slice(-32) + Math.random().toString(36).slice(-32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create verification token using the existing schema
    await prisma.verificationToken.upsert({
      where: { token },
      update: { 
        identifier: user.email, 
        token, 
        expires: expiresAt 
      },
      create: { 
        identifier: user.email, 
        token, 
        expires: expiresAt 
      }
    });
    
    console.log(`🔑 Verification token created for: ${user.email}`);

    // Send email invitation
    try {
      console.log('📧 Setting up email transport...');
      const host = process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST;
      const port = Number(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || 587);
      const userSmtp = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
      const passSmtp = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;
      const secure = (process.env.EMAIL_SERVER_SECURE || process.env.SMTP_SECURE) === 'true' || port === 465;

      let transporter;
      if (host) {
        transporter = nodemailer.createTransport({ host, port, secure, auth: userSmtp && passSmtp ? { user: userSmtp, pass: passSmtp } : undefined });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAccount.user, pass: testAccount.pass } });
      }

      const resetUrl = `${getPlatformUrl()}/auth/reset-password?token=${token}`;
      console.log(`🔗 Reset URL generated: ${resetUrl}`);
      
      // Use email template
      const emailData = {
        fullName,
        email,
        username: user.username,
        role,
        resetUrl,
        customMessage,
        platformName: getPlatformName()
      };
      
      console.log('📝 Generating email content...');
      const emailContent = emailTemplates.userInvitation(emailData);
      
      if (!emailContent.subject || !emailContent.html || !emailContent.text) {
        throw new Error('Email template generation failed');
      }
      
      console.log('📤 Sending email...');
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_FROM || userSmtp,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });
      
      console.log('✅ Email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Delete the user if email fails
      await prisma.user.delete({ where: { id: user.id } });
      // Delete the verification token as well
      await prisma.verificationToken.delete({ where: { token } });
      
      let errorMessage = 'User created but invitation email failed to send. ';
      if (emailError.message.includes('SMTP configuration')) {
        errorMessage += 'Please configure SMTP settings in your environment variables.';
      } else {
        errorMessage += 'Please check your SMTP configuration and try again.';
      }
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: 500 });
    }

    console.log('🎉 User invitation completed successfully');

    return NextResponse.json({ 
      message: 'User invited successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Invite user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


