import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runAllocation } from '@/lib/algorithm';
import type { LockedAssignment, StudentRow } from '@/lib/algorithm/types';

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

// POST /api/allocate — run algorithm, write results to DB
export async function POST() {
  const supabase = serverClient();
  try {
    // Fetch all student profiles
    const { data: profiles, error: fetchErr } = await supabase
      .from('student_profiles')
      .select('*');

    if (fetchErr) throw fetchErr;
    if (!profiles?.length) {
      return NextResponse.json(
        { error: 'No student profiles found. Run npm run db:seed first.' },
        { status: 400 }
      );
    }

    const students: StudentRow[] = profiles.map(p => ({
      id:                      p.id,
      nus_id:                  p.nus_id                  ?? '',
      faculty:                 p.faculty                 ?? null,
      race:                    p.race                    ?? null,
      extraversion:            p.extraversion            ?? 0.5,
      openness:                p.openness                ?? 0.5,
      agreeableness:           p.agreeableness           ?? 0.5,
      conscientiousness:       p.conscientiousness       ?? 0.5,
      social_catalyst_score:   p.social_catalyst_score   ?? 0.5,
      room_type_preference:    p.room_type_preference    ?? 'no_preference',
      gender_floor_preference: p.gender_floor_preference ?? 'no_preference',
      sleep_schedule:          p.sleep_schedule          ?? 0.5,
      requires_accessibility:  p.requires_accessibility  ?? false,
    }));

    // Fetch locked allocations from the latest run (Phase 0 returners)
    const lockedAssignments = new Map<string, LockedAssignment>();

    const { data: latestRun } = await supabase
      .from('allocation_runs')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestRun) {
      const { data: locked } = await supabase
        .from('student_allocations')
        .select('student_profile_id, floor_number, room_type_assigned, unit_number')
        .eq('run_id', latestRun.id)
        .eq('is_locked', true);

      for (const row of locked ?? []) {
        lockedAssignments.set(row.student_profile_id, {
          floor:      row.floor_number,
          roomType:   row.room_type_assigned,
          unitNumber: row.unit_number ?? undefined,
        });
      }
    }

    const { runId, entries, summary } = runAllocation(
      students,
      lockedAssignments.size > 0 ? lockedAssignments : undefined
    );

    // Persist run metadata
    const { error: runErr } = await supabase
      .from('allocation_runs')
      .insert({
        id:             runId,
        global_fitness: summary.global_fitness,
        duration_ms:    summary.duration_ms,
        student_count:  summary.student_count,
        floor_scores:   summary.floor_scores,
      });
    if (runErr) throw runErr;

    // Persist allocations in batches
    for (let i = 0; i < entries.length; i += 100) {
      const { error: allocErr } = await supabase
        .from('student_allocations')
        .insert(entries.slice(i, i + 100));
      if (allocErr) throw allocErr;
    }

    return NextResponse.json({ run_id: runId, ...summary });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}

// DELETE /api/allocate — remove non-locked (incoming) allocations from latest run
export async function DELETE() {
  const supabase = serverClient();
  try {
    const { data: latestRun } = await supabase
      .from('allocation_runs')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestRun) {
      return NextResponse.json({ error: 'No allocation run found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('student_allocations')
      .delete()
      .eq('run_id', latestRun.id)
      .eq('is_locked', false);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}

// GET /api/allocate — latest run with per-floor allocation data
export async function GET() {
  const supabase = serverClient();
  try {
    const [runResult, countResult] = await Promise.all([
      supabase
        .from('allocation_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true }),
    ]);

    if (runResult.error) throw runResult.error;

    const totalStudents = countResult.count ?? 0;
    const run           = runResult.data;

    if (!run) {
      return NextResponse.json({ run: null, allocations: [], totalStudents });
    }

    const { data: allocations, error: allocErr } = await supabase
      .from('student_allocations')
      .select('floor_number, archetype, floor_score, nus_id, room_type_assigned')
      .eq('run_id', run.id);

    if (allocErr) throw allocErr;

    // Override stored student_count with actual current allocation count
    // (stored value becomes stale after a reset-incoming operation)
    const liveRun = { ...run, student_count: allocations?.length ?? 0 };
    return NextResponse.json({ run: liveRun, allocations: allocations ?? [], totalStudents });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}
