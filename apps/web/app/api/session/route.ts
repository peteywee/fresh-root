import { NextRequest, NextResponse } from 'next/server'

// Minimal session endpoint. In production, verify idToken with Firebase Admin and set a secure session cookie.
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    // TODO: Verify with Firebase Admin and set cookie; for now, no-op success
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE() {
  // TODO: Clear session cookie; no-op for now
  return NextResponse.json({ status: 'cleared' }, { status: 200 })
}
