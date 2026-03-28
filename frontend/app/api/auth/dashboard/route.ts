import { NextResponse } from 'next/server';

// POST /api/auth/dashboard — verify passcode server-side (keeps it out of the client bundle)
export async function POST(request: Request) {
  const { passcode } = await request.json();
  const expected = process.env.DASHBOARD_PASSCODE ?? 'sorting2026';

  if (passcode === expected) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 });
}
