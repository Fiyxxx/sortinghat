import { randomUUID } from 'crypto';
import type { StudentRow, AllocationEntry, RunSummary, LockedAssignment } from './types';
import { classifyArchetype } from './classify';
import { floorScore } from './score';
import { greedyAssign } from './greedy';
import { simulatedAnnealing } from './annealing';
import buildingLayoutData from './building_layout.json';
import type { FloorLayout } from './types';

const LAYOUT = buildingLayoutData.floors as FloorLayout[];

/**
 * djb2 hash of all student IDs (sorted) → deterministic SA seed.
 * Same set of students always produces the same allocation.
 */
function computeSeed(students: StudentRow[]): number {
  const ids = [...students].map(s => s.id).sort().join('');
  let h = 5381;
  for (let i = 0; i < ids.length; i++) {
    h = ((h << 5) + h + ids.charCodeAt(i)) & 0xffffffff;
  }
  return h >>> 0;
}

/** Mulberry32 seeded PRNG — same as used in annealing.ts */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

function shuffleArr<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Build the ordered unit number pool for a given floor level.
 *
 * Standard floor (32 single, 8 suite, 0 accessible):
 *   singles    150–181  (32 numbers)
 *   suite 1    182A–D
 *   suite 2    183A–D
 *
 * Amenity floor L9/L17 (30 single, 2 accessible, 8 suite):
 *   singles    150–179  (30 numbers)
 *   accessible 180–181  (2 numbers)
 *   suite 1    182A–D
 *   suite 2    183A–D
 */
function buildFloorUnitPool(level: number): {
  single:     string[];
  accessible: string[];
  suite:      string[];
} {
  const floorDef    = LAYOUT.find(f => f.level === level)!;
  const singleCount = floorDef.single;                       // 32 or 30
  const single      = Array.from({ length: singleCount }, (_, i) => String(150 + i));

  const accessibleStart = 150 + singleCount;                 // 180 (amenity) or 182 (standard)
  const accessible      = floorDef.accessible > 0
    ? Array.from({ length: floorDef.accessible }, (_, i) => String(accessibleStart + i))
    : [];

  // Suite base is always right after single+accessible slots → 182 for all floors
  const suiteBase = accessibleStart + floorDef.accessible;   // 182 for every floor
  const suite: string[] = [];
  for (let s = 0; s < 2; s++) {
    for (const letter of ['A', 'B', 'C', 'D']) {
      suite.push(`${suiteBase + s}${letter}`);
    }
  }

  return { single, accessible, suite };
}

/**
 * Assign a unit number to every student based on their floor + room type.
 * Locked students keep their existing unitNumber if one is provided.
 * Remaining slots are filled from a seeded-shuffled pool (no duplicates per floor).
 */
function assignUnitNumbers(
  floors:           Map<number, StudentRow[]>,
  assigned:         Map<string, { floor: number; roomType: string }>,
  lockedAssignments: Map<string, LockedAssignment> | undefined,
  rng:              () => number
): Map<string, string> {
  const unitMap = new Map<string, string>(); // student.id → unit_number

  for (const [level, residents] of floors) {
    const pool = buildFloorUnitPool(level);

    // Pre-assign locked students with an existing unit number
    const usedSingle     = new Set<string>();
    const usedAccessible = new Set<string>();
    const usedSuite      = new Set<string>();

    for (const student of residents) {
      const lock = lockedAssignments?.get(student.id);
      if (lock?.unitNumber) {
        unitMap.set(student.id, lock.unitNumber);
        const rt = assigned.get(student.id)?.roomType ?? 'single';
        if (rt === 'suite')      usedSuite.add(lock.unitNumber);
        else if (rt === 'accessible') usedAccessible.add(lock.unitNumber);
        else                          usedSingle.add(lock.unitNumber);
      }
    }

    // Available (unoccupied) pools
    const availSingle     = pool.single.filter(u => !usedSingle.has(u));
    const availAccessible = pool.accessible.filter(u => !usedAccessible.has(u));
    const availSuite      = pool.suite.filter(u => !usedSuite.has(u));

    shuffleArr(availSingle, rng);
    shuffleArr(availAccessible, rng);
    shuffleArr(availSuite, rng);

    let si = 0, ai = 0, qi = 0;
    for (const student of residents) {
      if (unitMap.has(student.id)) continue; // already pre-assigned
      const rt = assigned.get(student.id)?.roomType ?? 'single';
      if (rt === 'suite')           unitMap.set(student.id, availSuite[qi++]      ?? `${182}?`);
      else if (rt === 'accessible') unitMap.set(student.id, availAccessible[ai++] ?? `180?`);
      else                          unitMap.set(student.id, availSingle[si++]     ?? `${150}?`);
    }
  }

  return unitMap;
}

function generateRationale(
  student:       StudentRow,
  floorLevel:    number,
  floorResidents: StudentRow[]
): string {
  const archetype = classifyArchetype(student);
  const others    = floorResidents.filter(r => r.id !== student.id);
  const reasons: string[] = [];

  if (student.faculty) {
    const existing = others.map(r => r.faculty).filter(Boolean);
    if (!existing.includes(student.faculty)) reasons.push(`fills ${student.faculty} gap`);
  }

  const existingArchetypes = others.map(classifyArchetype);
  if (!existingArchetypes.includes(archetype)) reasons.push(`adds ${archetype} archetype`);

  if (others.length >= 3) {
    const median = others.reduce((s, r) => s + r.sleep_schedule, 0) / others.length;
    if (Math.abs(student.sleep_schedule - median) < 0.15) {
      reasons.push('sleep schedule aligns with floor median');
    }
  }

  if (reasons.length === 0) reasons.push('best available diversity fit');
  return `Level ${floorLevel}: ${reasons.join('; ')}.`;
}

/**
 * Run the full allocation pipeline.
 *
 * @param students            All student profiles to allocate.
 * @param lockedAssignments   Map of student_id → { floor, roomType, unitNumber? } for returners.
 *                            These are pre-placed in Phase 0 and never moved by SA.
 *                            Existing unitNumber is preserved across runs.
 */
export function runAllocation(
  students:          StudentRow[],
  lockedAssignments?: Map<string, LockedAssignment>
): {
  runId:   string;
  entries: AllocationEntry[];
  summary: Omit<RunSummary, 'run_id'>;
} {
  const start = Date.now();
  const runId = randomUUID();
  const seed  = computeSeed(students);

  const { floors, assigned, lockedIds } = greedyAssign(students, lockedAssignments);
  simulatedAnnealing(floors, assigned, lockedIds, seed);

  const floorScores: Record<number, number> = {};
  for (const [level, residents] of floors) {
    floorScores[level] = parseFloat(floorScore(residents).toFixed(3));
  }

  const globalMin = Math.min(...Object.values(floorScores));

  // Assign unit numbers after SA (stable floor assignment)
  const rng         = mulberry32(seed + 1); // offset from SA seed to avoid correlation
  const unitNumbers = assignUnitNumbers(floors, assigned, lockedAssignments, rng);

  const entries: AllocationEntry[] = [];
  for (const student of students) {
    const a = assigned.get(student.id);
    if (!a) continue;
    const unitNumber = unitNumbers.get(student.id) ?? '';
    entries.push({
      run_id:              runId,
      student_profile_id:  student.id,
      nus_id:              student.nus_id,
      floor_number:        a.floor,
      unit_number:         unitNumber,
      room_type_assigned:  a.roomType,
      placement_rationale: `Room ${a.floor}-${unitNumber} — ${generateRationale(student, a.floor, floors.get(a.floor)!)}`,
      floor_score:         floorScores[a.floor],
      archetype:           classifyArchetype(student),
      is_locked:           lockedIds.has(student.id),
    });
  }

  return {
    runId,
    entries,
    summary: {
      floor_scores:   floorScores,
      global_fitness: parseFloat(globalMin.toFixed(3)),
      duration_ms:    Date.now() - start,
      student_count:  students.length,
    },
  };
}

export type { StudentRow, AllocationEntry, RunSummary, LockedAssignment } from './types';
