import type { StudentRow } from './types';
import { classifyArchetype } from './classify';

const ARCHETYPES_K = 6;
const FACULTIES_K  = 9;
const RACES_K      = 10;

export function shannonEntropy(labels: string[]): number {
  if (labels.length === 0) return 0;
  const counts: Record<string, number> = {};
  for (const l of labels) counts[l] = (counts[l] ?? 0) + 1;
  const n = labels.length;
  return -Object.values(counts).reduce(
    (sum, c) => sum + (c / n) * Math.log2(c / n),
    0
  );
}

export function normalisedEntropy(labels: string[], k: number): number {
  if (labels.length === 0 || k <= 1) return 0;
  return shannonEntropy(labels) / Math.log2(k);
}

export function sleepCompatibilityScore(schedules: number[]): number {
  if (schedules.length < 2) return 1;
  const mean = schedules.reduce((a, b) => a + b, 0) / schedules.length;
  const variance =
    schedules.reduce((sum, v) => sum + (v - mean) ** 2, 0) / schedules.length;
  // Variance > 0.08 → conflict risk; degrades linearly
  return Math.max(0, 1 - variance / 0.08);
}

export function catalystScore(students: StudentRow[]): number {
  const catalysts = students.filter(s => s.social_catalyst_score > 0.65).length;
  if (catalysts >= 3) return 1.0;
  if (catalysts === 2) return 0.75;
  if (catalysts === 1) return 0.35;
  return 0;
}

export function floorScore(students: StudentRow[]): number {
  if (students.length === 0) return 0;

  const archetypes = students.map(classifyArchetype);
  const faculties  = students.map(s => s.faculty).filter(Boolean) as string[];
  const races      = students.map(s => s.race).filter(Boolean)    as string[];
  const sleeps     = students.map(s => s.sleep_schedule);

  return (
    normalisedEntropy(archetypes, ARCHETYPES_K) * 0.30 +
    normalisedEntropy(faculties,  FACULTIES_K)  * 0.25 +
    normalisedEntropy(races,      RACES_K)      * 0.25 +
    sleepCompatibilityScore(sleeps)             * 0.10 +
    catalystScore(students)                     * 0.10
  );
}

export function globalFitness(floors: Map<number, StudentRow[]>): number {
  const scores = [...floors.values()].map(floorScore);
  if (scores.length === 0) return 0;
  return Math.min(...scores);
}
