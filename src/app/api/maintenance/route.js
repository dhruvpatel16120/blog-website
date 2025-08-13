import { NextResponse } from 'next/server';

export async function GET() {
  const envVal = process.env.MAINTENANCE_MODE;
  const maintenance = typeof envVal !== 'undefined' && String(envVal).toLowerCase() === 'true';
  return NextResponse.json({ maintenance }, { status: 200 });
}


