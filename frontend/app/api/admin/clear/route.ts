import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function isAuthorized(request: Request): boolean {
  const auth     = request.headers.get('Authorization') ?? '';
  const expected = `Bearer ${process.env.DASHBOARD_PASSCODE ?? 'sorting2026'}`;
  return auth === expected;
}

// POST /api/admin/clear — wipe all three tables (child before parent)
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = serverClient();
  const nil   = '00000000-0000-0000-0000-000000000000';

  const { error: a } = await admin.from('student_allocations').delete().neq('id', nil);
  if (a) return NextResponse.json({ error: a.message }, { status: 500 });

  const { error: r } = await admin.from('allocation_runs').delete().neq('id', nil);
  if (r) return NextResponse.json({ error: r.message }, { status: 500 });

  const { error: p } = await admin.from('student_profiles').delete().neq('id', nil);
  if (p) return NextResponse.json({ error: p.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
