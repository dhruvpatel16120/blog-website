import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { name, email, subject, message } = body || {}

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (String(message).trim().length < 10) {
      return NextResponse.json({ error: 'Message is too short' }, { status: 400 })
    }

    await prisma.contact.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim(),
        subject: subject ? String(subject).trim() : null,
        message: String(message).trim(),
        // status defaults to PENDING per schema
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Error creating contact message:', e)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}


