import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === 'string') return e.message;
    return JSON.stringify(e);
  }
  return String(err);
}

// GET /api/students?floor=N&status=allocated|unallocated
export async function GET(request: Request) {
  const supabase = serverClient();
  const { searchParams } = new URL(request.url);
  const floorParam = searchParams.get('floor');
  const status     = searchParams.get('status') ?? 'allocated';
  const floor      = floorParam ? parseInt(floorParam, 10) : null;

  try {
    // Get latest run (needed for both views)
    const { data: latestRun } = await supabase
      .from('allocation_runs')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // ── Unallocated view ──────────────────────────────────────────────────────
    if (status === 'unallocated') {
      const { data: profiles, error: profileErr } = await supabase
        .from('student_profiles')
        .select('id, nus_id, faculty, race, sleep_schedule, requires_accessibility, created_at')
        .order('created_at', { ascending: false });

      if (profileErr) throw profileErr;

      if (!latestRun || !profiles?.length) {
        // No run → every profile is unallocated
        return NextResponse.json({
          students: (profiles ?? []).map(p => ({
            nus_id:                 p.nus_id,
            faculty:                p.faculty               ?? null,
            race:                   p.race                  ?? null,
            sleep_schedule:         p.sleep_schedule        ?? null,
            requires_accessibility: p.requires_accessibility ?? false,
            submitted_at:           p.created_at,
          })),
        });
      }

      // Find which profile IDs are already in the latest run
      const { data: allocations } = await supabase
        .from('student_allocations')
        .select('student_profile_id')
        .eq('run_id', latestRun.id);

      const allocatedIds = new Set((allocations ?? []).map(a => a.student_profile_id));

      const unallocated = profiles
        .filter(p => !allocatedIds.has(p.id))
        .map(p => ({
          nus_id:                 p.nus_id,
          faculty:                p.faculty               ?? null,
          race:                   p.race                  ?? null,
          sleep_schedule:         p.sleep_schedule        ?? null,
          requires_accessibility: p.requires_accessibility ?? false,
          submitted_at:           p.created_at,
        }));

      return NextResponse.json({ students: unallocated });
    }

    // ── Allocated view (default) ──────────────────────────────────────────────
    if (!latestRun) {
      return NextResponse.json({ students: [] });
    }

    let query = supabase
      .from('student_allocations')
      .select(
        'student_profile_id, nus_id, floor_number, unit_number, room_type_assigned, archetype, placement_rationale, floor_score, is_locked'
      )
      .eq('run_id', latestRun.id);

    if (floor !== null && !isNaN(floor)) {
      query = query.eq('floor_number', floor);
    }

    const { data: allocations, error: allocErr } = await query
      .order('floor_number')
      .order('nus_id');

    if (allocErr) throw allocErr;
    if (!allocations?.length) return NextResponse.json({ students: [] });

    // Fetch all profiles (avoids URL-length limits from large .in() arrays)
    const { data: profiles, error: profileErr } = await supabase
      .from('student_profiles')
      .select('id, faculty, race, sleep_schedule');

    if (profileErr) throw profileErr;

    const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

    const students = allocations.map(a => {
      const profile = profileMap.get(a.student_profile_id);
      return {
        nus_id:              a.nus_id,
        floor_number:        a.floor_number,
        unit_number:         a.unit_number         ?? '',
        room_type_assigned:  a.room_type_assigned,
        archetype:           a.archetype,
        floor_score:         a.floor_score,
        is_locked:           a.is_locked,
        placement_rationale: a.placement_rationale,
        faculty:             profile?.faculty        ?? null,
        race:                profile?.race           ?? null,
        sleep_schedule:      profile?.sleep_schedule ?? null,
      };
    });

    return NextResponse.json({ students });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}
