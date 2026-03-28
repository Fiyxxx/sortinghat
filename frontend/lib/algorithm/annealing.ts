import type { StudentRow } from './types';
import { globalFitness } from './score';
import buildingLayoutData from './building_layout.json';
import type { FloorLayout } from './types';

const ACCESSIBLE_LEVELS = new Set(
  (buildingLayoutData.floors as FloorLayout[])
    .filter(f => f.accessible > 0)
    .map(f => f.level)
);

/**
 * Mulberry32 — fast, high-quality seeded PRNG.
 * Same seed always produces the same sequence, making SA deterministic.
 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

function canSwap(
  a: StudentRow, floorA: number,
  b: StudentRow, floorB: number,
  lockedIds: Set<string>
): boolean {
  if (lockedIds.has(a.id) || lockedIds.has(b.id))              return false;
  if (a.requires_accessibility && !ACCESSIBLE_LEVELS.has(floorB)) return false;
  if (b.requires_accessibility && !ACCESSIBLE_LEVELS.has(floorA)) return false;
  return true;
}

export function simulatedAnnealing(
  floors:    Map<number, StudentRow[]>,
  assigned:  Map<string, { floor: number; roomType: string }>,
  lockedIds: Set<string> = new Set(),
  seed       = 0
): void {
  const random  = mulberry32(seed);
  const levels  = [...floors.keys()];
  const T_INIT  = 1.0;
  const T_MIN   = 0.001;
  const ALPHA   = 0.995;
  const ITERS   = 5000;

  let T              = T_INIT;
  let currentFitness = globalFitness(floors);

  for (let i = 0; i < ITERS && T > T_MIN; i++, T *= ALPHA) {
    const ia = Math.floor(random() * levels.length);
    let   ib = Math.floor(random() * (levels.length - 1));
    if (ib >= ia) ib++;

    const floorA = levels[ia];
    const floorB = levels[ib];
    const resA   = floors.get(floorA)!;
    const resB   = floors.get(floorB)!;

    if (resA.length === 0 || resB.length === 0) continue;

    const pa = Math.floor(random() * resA.length);
    const pb = Math.floor(random() * resB.length);
    const sA = resA[pa];
    const sB = resB[pb];

    if (!canSwap(sA, floorA, sB, floorB, lockedIds)) continue;

    resA[pa] = sB;
    resB[pb] = sA;

    const newFitness = globalFitness(floors);
    const delta      = newFitness - currentFitness;

    if (delta > 0 || random() < Math.exp(delta / T)) {
      currentFitness = newFitness;
      assigned.set(sA.id, { ...assigned.get(sA.id)!, floor: floorB });
      assigned.set(sB.id, { ...assigned.get(sB.id)!, floor: floorA });
    } else {
      resA[pa] = sA;
      resB[pb] = sB;
    }
  }
}
