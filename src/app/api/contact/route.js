import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { enqueueEmail } from '@/lib/email-queue'
import { headers } from 'next/headers'

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

    // Enqueue confirmation and admin notification emails (asynchronous & non-blocking)
    let emailQueued = false;
    
    if (!isSpam) {
      try {
        // 1. User acknowledgement email
        await enqueueEmail({
          to: contact.email,
          subject: `Thank you for contacting TechBlog: ${contact.subject || 'General Inquiry'}`,
          body: contact.message,
          type: 'CONTACT_NOTIFICATION',
          metadata: {
            isAck: true,
            contactId: contact.id,
            name: contact.name,
            subject: contact.subject,
            message: contact.message,
          },
        });

        // 2. Admin notification email
        await enqueueEmail({
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_SERVER_USER || 'admin@techblog.com',
          subject: `[New Contact] ${contact.subject || 'General Inquiry'} from ${contact.name}`,
          body: contact.message,
          type: 'CONTACT_NOTIFICATION',
          metadata: {
            isAdminNotification: true,
            contactId: contact.id,
            name: contact.name,
            email: contact.email,
            category: contact.category,
            priority: contact.priority,
            source: contact.source,
            spamScore: finalSpamScore,
            message: contact.message,
          },
        });

        emailQueued = true;
      } catch (queueErr) {
        console.error('Failed to enqueue contact emails:', queueErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      messageId: contact.id,
      emailQueued,
      spamScore: finalSpamScore,
      isSpam,
      message: 'Your message has been received. Our team will get back to you shortly!'
    });

  } catch (e) {
    console.error('Error creating contact message:', e)
    return NextResponse.json({ 
      error: 'Failed to send message. Please try again later.' 
    }, { status: 500 })
  }
}


