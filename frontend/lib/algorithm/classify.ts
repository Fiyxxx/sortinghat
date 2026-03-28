import type { StudentRow } from './types';

export function classifyArchetype(
  s: Pick<StudentRow, 'extraversion' | 'openness' | 'agreeableness' | 'conscientiousness'>
): string {
  const { extraversion: e, openness: o, agreeableness: a, conscientiousness: c } = s;
  if (e > 0.7 && a > 0.6) return 'connector';
  if (e > 0.7 && o > 0.7) return 'explorer';
  if (e < 0.4 && c > 0.7) return 'anchor';
  if (o > 0.7 && a > 0.6) return 'harmoniser';
  if (e < 0.4 && o > 0.6) return 'thinker';
  return 'adaptor';
}
