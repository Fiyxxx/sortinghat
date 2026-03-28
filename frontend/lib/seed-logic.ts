import type { SupabaseClient } from '@supabase/supabase-js';
import { runAllocation } from './algorithm/index';
import type { StudentRow } from './algorithm/types';

// ─── Archetype definitions ────────────────────────────────────────────────────

type Range = [number, number];

interface ArchetypeProfile {
  extraversion:          Range;
  openness:              Range;
  agreeableness:         Range;
  conscientiousness:     Range;
  social_catalyst_score: Range;
  sleep_schedule:        Range;
  room_pref:             string[];
  floor_chat_answer:     string[];
  friday_night_answer:   string[];
  intl_seat_answer:      string[];
}

const ARCHETYPES: Record<string, ArchetypeProfile> = {
  connector: {
    extraversion:          [0.72, 0.95],
    openness:              [0.40, 0.75],
    agreeableness:         [0.65, 0.92],
    conscientiousness:     [0.38, 0.68],
    social_catalyst_score: [0.78, 0.97],
    sleep_schedule:        [0.55, 0.82],
    room_pref:             ['suite', 'suite', 'no_preference'],
    floor_chat_answer:     ['send_meme', 'post_poll'],
    friday_night_answer:   ['big_group', 'small_group'],
    intl_seat_answer:      ['excited', 'comfortable'],
  },
  explorer: {
    extraversion:          [0.72, 0.95],
    openness:              [0.72, 0.97],
    agreeableness:         [0.28, 0.62],
    conscientiousness:     [0.22, 0.58],
    social_catalyst_score: [0.62, 0.88],
    sleep_schedule:        [0.68, 0.97],
    room_pref:             ['no_preference', 'suite', 'no_preference'],
    floor_chat_answer:     ['send_meme', 'post_poll', 'private_message'],
    friday_night_answer:   ['big_group', 'small_group'],
    intl_seat_answer:      ['excited', 'excited', 'comfortable'],
  },
  anchor: {
    extraversion:          [0.08, 0.36],
    openness:              [0.18, 0.52],
    agreeableness:         [0.45, 0.75],
    conscientiousness:     [0.75, 0.97],
    social_catalyst_score: [0.08, 0.32],
    sleep_schedule:        [0.03, 0.32],
    room_pref:             ['single', 'single', 'no_preference'],
    floor_chat_answer:     ['enjoy_peace', 'private_message'],
    friday_night_answer:   ['solo', 'one_on_one'],
    intl_seat_answer:      ['comfortable', 'awkward', 'comfortable'],
  },
  harmoniser: {
    extraversion:          [0.28, 0.65],
    openness:              [0.72, 0.95],
    agreeableness:         [0.65, 0.90],
    conscientiousness:     [0.48, 0.75],
    social_catalyst_score: [0.42, 0.72],
    sleep_schedule:        [0.22, 0.58],
    room_pref:             ['suite', 'no_preference', 'suite'],
    floor_chat_answer:     ['private_message', 'post_poll', 'send_meme'],
    friday_night_answer:   ['small_group', 'one_on_one'],
    intl_seat_answer:      ['excited', 'comfortable', 'excited'],
  },
  thinker: {
    extraversion:          [0.08, 0.36],
    openness:              [0.65, 0.93],
    agreeableness:         [0.33, 0.63],
    conscientiousness:     [0.42, 0.72],
    social_catalyst_score: [0.12, 0.42],
    sleep_schedule:        [0.40, 0.80],
    room_pref:             ['single', 'single', 'no_preference'],
    floor_chat_answer:     ['enjoy_peace', 'private_message'],
    friday_night_answer:   ['solo', 'one_on_one', 'small_group'],
    intl_seat_answer:      ['excited', 'comfortable'],
  },
  adaptor: {
    extraversion:          [0.32, 0.68],
    openness:              [0.32, 0.68],
    agreeableness:         [0.32, 0.68],
    conscientiousness:     [0.32, 0.68],
    social_catalyst_score: [0.32, 0.68],
    sleep_schedule:        [0.12, 0.78],
    room_pref:             ['no_preference', 'single', 'suite'],
    floor_chat_answer:     ['send_meme', 'private_message', 'enjoy_peace', 'post_poll'],
    friday_night_answer:   ['big_group', 'small_group', 'one_on_one', 'solo'],
    intl_seat_answer:      ['excited', 'comfortable', 'awkward'],
  },
};

// ─── Data pools ───────────────────────────────────────────────────────────────

const HOPE_TO_EXPERIENCE = [
  "Living with people from completely different backgrounds who challenge my worldview",
  "Those spontaneous late-night kitchen conversations that turn into 3am adventures",
  "Building a floor culture where everyone actually knows each other's names",
  "Finding a study group that motivates each other through exam season",
  "Discovering a hobby I never expected to love through my floormates",
  "Creating traditions that the floor carries on after we leave",
  "Deep conversations with people who have different life philosophies",
  "Feeling like I have a second family by the end of the semester",
  "Learning about cultures I've never encountered before",
  "Being pushed outside my comfort zone by people who genuinely care",
  "Finally living with people who are as passionate about things as I am",
  "Making friends who will be at my wedding someday",
  "Having a quiet, focused environment to do my best academic work",
  "The messiness of real community — shared meals, shared problems, shared wins",
  "Someone to knock on my door and drag me out when I'm overthinking",
  "Learning to compromise and live with people very different from myself",
  "Seeing how other people structure their daily routines differently from mine",
  "Getting better at conflict resolution in a low-stakes environment",
];

const FLOOR_EVENT_IDEAS = [
  "A mystery ingredient cooking challenge at 11pm with whatever's left in the pantry",
  "A floor board game bracket — one game per week, finals at the end of sem",
  "Silent study hours in the lounge with lo-fi music, snacks, everyone welcome",
  "A 'teach me something' session where each person shares a 5-min skill",
  "Film night where we take turns picking obscure movies from our home countries",
  "Morning run at 6am every Saturday — doesn't matter how slow, just show up",
  "A floor cookbook where everyone contributes one recipe from home",
  "Secret santa but you have to make something instead of buying it",
  "Floor photo walk — phones out, we explore one part of campus we've never been to",
  "Midnight ramen run — someone picks a spot, everyone goes",
  "A 'real talk' dinner where phones go away and we actually talk about life",
  "Karaoke night in the lounge, mandatory but intentionally low-bar",
  "A jigsaw puzzle that lives on the common table all sem — everyone adds pieces",
  "Adopt a floor plant and collectively keep it alive as a team challenge",
  "Late-night walkathon across campus when no one can sleep",
  "Monthly potluck where everyone makes something from their culture",
  "A group workout challenge — 30-day streak, whoever drops out buys supper",
  "Floor Olympics — dumb indoor games, winner gets bragging rights on the chat",
];

const FACULTY_BY_ARCHETYPE: Record<string, string[]> = {
  connector:  ['Faculty of Arts and Social Sciences', 'Faculty of Arts and Social Sciences', 'NUS Business School', 'NUS Business School', 'College of Design and Engineering', 'Faculty of Science', 'School of Computing', 'College of Humanities and Sciences', 'Faculty of Law'],
  explorer:   ['Faculty of Arts and Social Sciences', 'College of Humanities and Sciences', 'College of Humanities and Sciences', 'NUS Business School', 'Faculty of Science', 'College of Design and Engineering', 'School of Computing', 'Yong Loo Lin School of Medicine', 'Yong Siew Toh Conservatory of Music'],
  anchor:     ['School of Computing', 'School of Computing', 'College of Design and Engineering', 'College of Design and Engineering', 'Faculty of Science', 'Faculty of Science', 'NUS Business School', 'Faculty of Arts and Social Sciences', 'Faculty of Law'],
  harmoniser: ['Faculty of Arts and Social Sciences', 'Faculty of Arts and Social Sciences', 'Yong Loo Lin School of Medicine', 'College of Humanities and Sciences', 'NUS Business School', 'College of Design and Engineering', 'Faculty of Science', 'School of Computing'],
  thinker:    ['School of Computing', 'School of Computing', 'Faculty of Science', 'Faculty of Science', 'Faculty of Law', 'Faculty of Arts and Social Sciences', 'College of Design and Engineering', 'College of Humanities and Sciences', 'Yong Siew Toh Conservatory of Music'],
  adaptor:    ['College of Design and Engineering', 'Faculty of Arts and Social Sciences', 'School of Computing', 'NUS Business School', 'Faculty of Science', 'College of Humanities and Sciences', 'Faculty of Law', 'Yong Loo Lin School of Medicine'],
};

const RACE_POOL: [string, number][] = [
  ['Chinese', 52], ['Indian', 17], ['Malay', 13], ['Eurasian', 5],
  ['Korean', 4], ['Indonesian', 3], ['Thai', 2], ['Filipino', 2],
  ['Japanese', 1], ['Vietnamese', 1],
];

// ─── Utilities ────────────────────────────────────────────────────────────────

const rand  = (min: number, max: number) => Math.random() * (max - min) + min;
const pick  = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v: number) => parseFloat(Math.max(0, Math.min(1, v)).toFixed(2));

function pickWeighted<T>(pool: [T, number][]): T {
  const total = pool.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [item, weight] of pool) {
    r -= weight;
    if (r <= 0) return item;
  }
  return pool[pool.length - 1][0];
}

function nusId(n: number): string {
  const suffix = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return `A0${String(n).padStart(7, '0')}${suffix[n % suffix.length]}`;
}

function generateStudent(archetype: string, index: number) {
  const p = ARCHETYPES[archetype];
  const conscientiousness = clamp(rand(...p.conscientiousness));
  const extraversion      = clamp(rand(...p.extraversion));
  const openness          = clamp(rand(...p.openness));
  const agreeableness     = clamp(rand(...p.agreeableness));
  const social_catalyst   = clamp(rand(...p.social_catalyst_score));
  const sleep_schedule    = clamp(rand(...p.sleep_schedule));

  return {
    nus_id:                  nusId(index + 1),
    faculty:                 pick(FACULTY_BY_ARCHETYPE[archetype]),
    race:                    pickWeighted(RACE_POOL),
    extraversion,
    openness,
    agreeableness,
    conscientiousness,
    social_catalyst_score:   social_catalyst,
    room_type_preference:    pick(p.room_pref),
    gender_floor_preference: pick(['same', 'mixed', 'no_preference', 'no_preference', 'no_preference']),
    sleep_schedule,
    hope_to_experience:      pick(HOPE_TO_EXPERIENCE),
    floor_event_idea:        pick(FLOOR_EVENT_IDEAS),
    requires_accessibility:  false,
    raw_responses: {
      floor_chat_silent:          pick(p.floor_chat_answer),
      dirty_dishes:               clamp(conscientiousness + rand(-0.08, 0.08)),
      international_student_seat: pick(p.intl_seat_answer),
      ideal_friday_night:         pick(p.friday_night_answer),
    },
  };
}

function toStudentRow(p: Record<string, unknown>): StudentRow {
  return {
    id:                      p.id                      as string,
    nus_id:                  (p.nus_id                  as string)  ?? '',
    faculty:                 (p.faculty                 as string)  ?? null,
    race:                    (p.race                    as string)  ?? null,
    extraversion:            (p.extraversion            as number)  ?? 0.5,
    openness:                (p.openness                as number)  ?? 0.5,
    agreeableness:           (p.agreeableness           as number)  ?? 0.5,
    conscientiousness:       (p.conscientiousness       as number)  ?? 0.5,
    social_catalyst_score:   (p.social_catalyst_score   as number)  ?? 0.5,
    room_type_preference:    (p.room_type_preference    as string)  ?? 'no_preference',
    gender_floor_preference: (p.gender_floor_preference as string)  ?? 'no_preference',
    sleep_schedule:          (p.sleep_schedule          as number)  ?? 0.5,
    requires_accessibility:  (p.requires_accessibility  as boolean) ?? false,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function runSeed(
  supabase: SupabaseClient,
  admin:    SupabaseClient,
): Promise<void> {
  const batches: [string, number][] = [
    ['connector',  90],
    ['explorer',   85],
    ['anchor',     85],
    ['harmoniser', 80],
    ['thinker',    85],
    ['adaptor',    75],
  ]; // total: 500

  const students: ReturnType<typeof generateStudent>[] = [];
  let idx = 0;
  for (const [archetype, count] of batches) {
    for (let i = 0; i < count; i++) {
      students.push(generateStudent(archetype, idx++));
    }
  }

  // Fisher-Yates shuffle
  for (let i = students.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [students[i], students[j]] = [students[j], students[i]];
  }

  // Exactly 3 students need accessibility
  for (let i = 0; i < 3; i++) {
    students[i].requires_accessibility = true;
  }

  const { error: insertErr } = await supabase.from('student_profiles').insert(students);
  if (insertErr) throw new Error(`Profile insert failed: ${insertErr.message}`);

  // Phase 2: locked allocation for 250 returning students
  const profileFields = 'id, nus_id, faculty, race, extraversion, openness, agreeableness, conscientiousness, social_catalyst_score, room_type_preference, gender_floor_preference, sleep_schedule, requires_accessibility';
  const { data: profiles, error: readErr } = await admin
    .from('student_profiles')
    .select(profileFields)
    .order('created_at', { ascending: false })
    .limit(students.length);

  if (readErr || !profiles?.length) {
    throw new Error(`Could not read back profiles: ${readErr?.message ?? 'empty result'}`);
  }

  const RETURNING_COUNT = 250;
  const returningRows = profiles
    .slice(0, RETURNING_COUNT)
    .map(p => toStudentRow(p as Record<string, unknown>));

  const { runId, entries, summary } = runAllocation(returningRows);

  const { error: runErr } = await admin.from('allocation_runs').insert({
    id:             runId,
    global_fitness: summary.global_fitness,
    duration_ms:    summary.duration_ms,
    student_count:  summary.student_count,
    floor_scores:   summary.floor_scores,
  });
  if (runErr) throw new Error(`Run insert failed: ${runErr.message}`);

  const lockedEntries = entries.map(e => ({ ...e, is_locked: true }));
  for (let i = 0; i < lockedEntries.length; i += 100) {
    const { error: allocErr } = await admin
      .from('student_allocations')
      .insert(lockedEntries.slice(i, i + 100));
    if (allocErr) throw new Error(`Allocation insert failed: ${allocErr.message}`);
  }
}
