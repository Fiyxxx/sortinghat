import buildingLayoutData from './building_layout.json';
import type { FloorCapacity, FloorLayout, LockedAssignment, StudentRow } from './types';
import { floorScore } from './score';

const LAYOUT = buildingLayoutData.floors as FloorLayout[];

const ACCESSIBLE_LEVELS = new Set(
  LAYOUT.filter(f => f.accessible > 0).map(f => f.level)
);

function initialCapacities(): Map<number, FloorCapacity> {
  const cap = new Map<number, FloorCapacity>();
  for (const f of LAYOUT) {
    cap.set(f.level, {
      total:      f.total,
      single:     f.single,
      suite:      f.suite,
      accessible: f.accessible,
    });
  }
  return cap;
}

function isEligible(s: StudentRow, level: number, cap: FloorCapacity): boolean {
  if (cap.total <= 0) return false;
  if (s.requires_accessibility) {
    return ACCESSIBLE_LEVELS.has(level) && cap.accessible > 0;
  }
  if (s.room_type_preference === 'single') return cap.single > 0 || cap.suite > 0;
  return true;
}

function consumeSlot(s: StudentRow, cap: FloorCapacity): string {
  if (s.requires_accessibility) { cap.accessible--; cap.total--; return 'accessible'; }
  if (s.room_type_preference === 'suite' && cap.suite > 0) { cap.suite--; cap.total--; return 'suite'; }
  if (cap.single > 0) { cap.single--; cap.total--; return 'single'; }
  cap.suite--; cap.total--; return 'suite';
}

function decrementForRoomType(roomType: string, cap: FloorCapacity): void {
  cap.total = Math.max(0, cap.total - 1);
  if (roomType === 'accessible') cap.accessible = Math.max(0, cap.accessible - 1);
  else if (roomType === 'suite')  cap.suite      = Math.max(0, cap.suite - 1);
  else                            cap.single     = Math.max(0, cap.single - 1);
}

function constraintRank(s: StudentRow): number {
  if (s.requires_accessibility)             return 0;
  if (s.gender_floor_preference === 'same') return 1;
  if (s.room_type_preference === 'single')  return 2;
  return 3;
}

/**
 * Pick the best eligible floor for a student.
 *
 * First pass: only floors below `targetPerFloor` (ensures balanced spread).
 * Second pass: any eligible floor (fallback when all floors are at target).
 */
function pickBestFloor(
  student:       StudentRow,
  floors:        Map<number, StudentRow[]>,
  capacity:      Map<number, FloorCapacity>,
  targetPerFloor: number
): number {
  let bestLevel = -1;
  let bestScore = -Infinity;

  for (let pass = 0; pass < 2; pass++) {
    for (const f of LAYOUT) {
      const cap     = capacity.get(f.level)!;
      const current = floors.get(f.level)!;

      if (!isEligible(student, f.level, cap)) continue;
      // First pass: skip over-target floors; second pass: allow all
      if (pass === 0 && current.length >= targetPerFloor) continue;

      const score = floorScore([...current, student]);
      if (score > bestScore) { bestScore = score; bestLevel = f.level; }
    }
    if (bestLevel !== -1) break;
  }

  // Hard fallback: any floor with capacity left
  if (bestLevel === -1) {
    for (const f of LAYOUT) {
      if (capacity.get(f.level)!.total > 0) { bestLevel = f.level; break; }
    }
  }

  return bestLevel;
}

export function greedyAssign(
  students:         StudentRow[],
  lockedAssignments?: Map<string, LockedAssignment>
): {
  floors:    Map<number, StudentRow[]>;
  assigned:  Map<string, { floor: number; roomType: string }>;
  lockedIds: Set<string>;
} {
  const floors    = new Map<number, StudentRow[]>();
  for (const f of LAYOUT) floors.set(f.level, []);

  const capacity  = initialCapacities();
  const assigned  = new Map<string, { floor: number; roomType: string }>();
  const lockedIds = new Set<string>();

  // ── Phase 0: pre-place locked / returning students ───────────────────────
  if (lockedAssignments) {
    const byId = new Map(students.map(s => [s.id, s]));
    for (const [studentId, lock] of lockedAssignments) {
      const student = byId.get(studentId);
      const cap     = capacity.get(lock.floor);
      if (!student || !cap || cap.total <= 0) continue;

      floors.get(lock.floor)!.push(student);
      assigned.set(studentId, lock);
      lockedIds.add(studentId);
      decrementForRoomType(lock.roomType, cap);
    }
  }

  // ── Phase 1: balanced greedy for remaining students ──────────────────────
  const remaining = students.filter(s => !lockedIds.has(s.id));
  const sorted    = [...remaining].sort((a, b) => constraintRank(a) - constraintRank(b));

  // Target: spread total students evenly across floors.
  // Floors already occupied by locked students count towards the target.
  const totalStudents  = students.length;
  const targetPerFloor = Math.ceil(totalStudents / LAYOUT.length);

  for (const student of sorted) {
    const bestLevel = pickBestFloor(student, floors, capacity, targetPerFloor);
    if (bestLevel === -1) continue;

    const cap      = capacity.get(bestLevel)!;
    const roomType = consumeSlot(student, cap);
    floors.get(bestLevel)!.push(student);
    assigned.set(student.id, { floor: bestLevel, roomType });
  }

  return { floors, assigned, lockedIds };
}
