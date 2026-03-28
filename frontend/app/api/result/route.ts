import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET /api/result?nusId=A0123456X
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nusId = searchParams.get('nusId')?.trim().toUpperCase();

  if (!nusId) {
    return NextResponse.json({ error: 'nusId required' }, { status: 400 });
  }

  const supabase = serverClient();

  // Get latest run
  const { data: latestRun } = await supabase
    .from('allocation_runs')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestRun) {
    return NextResponse.json({ error: 'No allocation run found' }, { status: 404 });
  }

  const { data: allocation, error } = await supabase
    .from('student_allocations')
    .select('nus_id, floor_number, unit_number')
    .eq('run_id', latestRun.id)
    .eq('nus_id', nusId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!allocation) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json({
    nus_id:       allocation.nus_id,
    floor_number: allocation.floor_number,
    unit_number:  allocation.unit_number,
  });
}
