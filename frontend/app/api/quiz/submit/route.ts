import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serverClient() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, svcKey);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const supabase = serverClient();
    const { error } = await supabase.from('student_profiles').insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
