import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'logo.png');
    const file = fs.readFileSync(filePath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, immutable'
      }
    });
  } catch (e) {
    return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
  }
}


