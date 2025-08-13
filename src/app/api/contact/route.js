import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import emailService from '@/lib/email-service'
import { headers } from 'next/headers'

// Debug logging
console.log('Contact API loaded, email service:', !!emailService);

export const dynamic = 'force-dynamic'

// Spam detection patterns
const SPAM_PATTERNS = [
  /\b(viagra|casino|loan|credit|money|free|click here|buy now|make money|earn money|work from home)\b/i,
  /[A-Z]{8,}/, // Too many consecutive caps
  /!{4,}/, // Too many exclamation marks
  /\b(www\.|http:\/\/|https:\/\/)\b/, // URLs
  /\b(guaranteed|limited time|act now|don't miss)\b/i,
  /\d{10,}/, // Too many consecutive numbers
];

// Calculate spam score
function calculateSpamScore(data) {
  let score = 0;
  
  // Time-based scoring
  if (data.timeSpent < 5000) score += 30; // Less than 5 seconds
  if (data.timeSpent < 2000) score += 20; // Very fast submission
  
  // Content-based scoring
  const message = (data.message || '').toLowerCase();
  SPAM_PATTERNS.forEach(pattern => {
    if (pattern.test(data.message)) score += 15;
  });
  
  // Length-based scoring
  if (data.message && data.message.length < 20) score += 10;
  if (data.message && data.message.length > 1000) score += 5;
  
  // Field-based scoring
  if (data.name && data.name.length < 2) score += 20;
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) score += 25;
  
  // Hidden field detection
  if (data.website) score += 50;
  
  return Math.min(score, 100);
}

// Rate limiting check
async function checkRateLimit(email, ipAddress) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentContacts = await prisma.contact.count({
    where: {
      OR: [
        { email: email },
        { ipAddress: ipAddress }
      ],
      createdAt: {
        gte: oneHourAgo
      }
    }
  });
  
  return recentContacts < 5; // Max 5 contacts per hour per email/IP
}

export async function POST(request) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    const body = await request.json().catch(() => ({}))
    const { 
      name, 
      email, 
      phone, 
      company, 
      subject, 
      message, 
      category, 
      priority, 
      source, 
      spamScore: clientSpamScore,
      timeSpent,
      userAgent: clientUserAgent,
      timestamp,
      agreeToTerms,
      subscribeNewsletter
    } = body || {}

    // Basic validation
    if (!name || !email || !message || !agreeToTerms) {
      return NextResponse.json({ 
        error: 'Missing required fields. Please fill in all required fields and agree to terms.' 
      }, { status: 400 })
    }

    if (String(message).trim().length < 10) {
      return NextResponse.json({ error: 'Message is too short' }, { status: 400 })
    }

    if (String(message).trim().length > 2000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Phone validation (if provided)
    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // Calculate server-side spam score
    const serverSpamScore = calculateSpamScore({
      message,
      name,
      email,
      timeSpent,
      website: body.website
    });

    // Use the higher of client and server scores
    const finalSpamScore = Math.max(clientSpamScore || 0, serverSpamScore);

    // Check rate limiting
    const rateLimitOk = await checkRateLimit(email, ipAddress);
    if (!rateLimitOk) {
      return NextResponse.json({ 
        error: 'Too many messages sent. Please wait before sending another message.' 
      }, { status: 429 })
    }

    // Determine if this is likely spam
    const isSpam = finalSpamScore > 70;

    // Create contact record
    const contact = await prisma.contact.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        company: company ? String(company).trim() : null,
        subject: subject ? String(subject).trim() : null,
        message: String(message).trim(),
        category: category || 'General Inquiry',
        priority: priority || 'MEDIUM',
        source: source || null,
        ipAddress,
        userAgent: clientUserAgent || userAgent,
        tags: [],
        isSpam,
        spamScore: finalSpamScore,
        verified: false, // Will be set to true when email is sent successfully
        status: isSpam ? 'SPAM' : 'PENDING'
      },
    })

    // Send confirmation email (non-blocking)
    let emailSent = false;
    let emailError = null;
    
    try {
      if (!isSpam) {
        console.log('📧 Attempting to send confirmation email to:', contact.email);
        
        const emailResult = await emailService.sendContactAcknowledgement({
          name: contact.name,
          email: contact.email,
          subject: contact.subject || 'General Inquiry',
          message: contact.message,
          platformName: process.env.PLATFORM_NAME || 'Our Blog Platform',
          platformUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@techblog.com'
        });
        
        console.log('📧 Confirmation email result:', emailResult);
        emailSent = emailResult;
        
        if (emailResult) {
          // Update contact with email success
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              emailSent: true,
              emailSentAt: new Date(),
              verified: true
            }
          });
          console.log('✅ Contact updated with email success');
        }
      }
    } catch (emailErr) {
      console.error('❌ Failed to send confirmation email:', emailErr);
      emailError = emailErr.message;
      
      // Update contact with email error
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          emailError: emailError
        }
      });
    }

    // Send admin notification (non-blocking)
    try {
      if (!isSpam) {
        console.log('📧 Attempting to send admin notification');
        
        const adminNotifyResult = await emailService.sendAdminNotification({
          contactId: contact.id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
          category: contact.category,
          priority: contact.priority,
          source: contact.source,
          spamScore: finalSpamScore
        });
        
        console.log('📧 Admin notification result:', adminNotifyResult);
      }
    } catch (notifyErr) {
      console.error('❌ Failed to send admin notification:', notifyErr);
    }

    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'contact_form_submitted', {
        event_category: 'engagement',
        event_label: category || 'General Inquiry',
        value: isSpam ? 0 : 1
      });
    }

    return NextResponse.json({ 
      success: true, 
      messageId: contact.id,
      emailSent,
      spamScore: finalSpamScore,
      isSpam
    })

  } catch (e) {
    console.error('Error creating contact message:', e)
    return NextResponse.json({ 
      error: 'Failed to send message. Please try again later.' 
    }, { status: 500 })
  }
}


