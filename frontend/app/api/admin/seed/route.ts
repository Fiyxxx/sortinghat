import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runSeed } from '@/lib/seed-logic';

function isAuthorized(request: Request): boolean {
  const auth     = request.headers.get('Authorization') ?? '';
  const expected = `Bearer ${process.env.DASHBOARD_PASSCODE ?? 'sorting2026'}`;
  return auth === expected;
}

// POST /api/admin/seed — insert 500 synthetic students + locked allocation for 250 returners
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(url, anonKey);
  const admin    = svcKey ? createClient(url, svcKey) : supabase;

  try {
    await runSeed(supabase, admin);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
