import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// 40% existing quiz-derived score + 60% AI-extracted signal.
function blend(existing: number, signal: number): number {
  return Math.round((0.4 * existing + 0.6 * signal) * 1000) / 1000;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileRow {
  id:                    string;
  extraversion:          number;
  openness:              number;
  social_catalyst_score: number;
  hope_to_experience:    string | null;
  floor_event_idea:      string | null;
}

interface AIExtraction {
  openness_signal:       number;
  extraversion_signal:   number;
  social_catalyst_score: number;
  interest_tags:         string[];
  summary:               string;
}

// ─── Prompt ──────────────────────────────────────────────────────────────────

function buildPrompt(profile: ProfileRow): string {
  const q1 = profile.hope_to_experience?.trim() || '(not answered)';
  const q2 = profile.floor_event_idea?.trim()    || '(not answered)';

  return `You are analysing a residential college student's open-ended survey responses to extract personality signals for a floor allocation algorithm.

Their responses:
Q1 — What they hope to experience in RC life:
"${q1}"

Q2 — Floor event they would organise:
"${q2}"

Return a JSON object with exactly these fields (no extra keys):
{
  "openness_signal": <float 0.0–1.0, curiosity and willingness to try new things>,
  "extraversion_signal": <float 0.0–1.0, social energy and gregariousness>,
  "social_catalyst_score": <float 0.0–1.0, likelihood to actively initiate communal activities>,
  "interest_tags": <array of 3–5 short interest/hobby labels, e.g. "cooking", "music", "hiking">,
  "summary": <one sentence, max 15 words, describing this person's social personality>
}

Score calibration:
- 0.8–1.0: very clear, strong signal in the text
- 0.5–0.7: moderate or implied signal
- 0.2–0.4: weak or absent signal
- If a question was not answered, default that signal to 0.5.`;
}

// ─── Process a single profile ─────────────────────────────────────────────────

async function processProfile(
  profile:  ProfileRow,
  supabase: SupabaseClient,
  openai:   OpenAI,
): Promise<void> {
  const completion = await openai.chat.completions.create({
    model:           'gpt-4o',
    response_format: { type: 'json_object' },
    temperature:     0.2,
    max_tokens:      300,
    messages: [
      { role: 'system', content: 'You extract personality signals from text and return only valid JSON.' },
      { role: 'user',   content: buildPrompt(profile) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const extracted: Partial<AIExtraction> = JSON.parse(raw);

  const openness_signal       = clamp(Number(extracted.openness_signal)       || 0.5);
  const extraversion_signal   = clamp(Number(extracted.extraversion_signal)   || 0.5);
  const social_catalyst_score = clamp(Number(extracted.social_catalyst_score) || 0.5);

  const { error } = await supabase
    .from('student_profiles')
    .update({
      openness:              blend(profile.openness,              openness_signal),
      extraversion:          blend(profile.extraversion,          extraversion_signal),
      social_catalyst_score: blend(profile.social_catalyst_score, social_catalyst_score),
    })
    .eq('id', profile.id);

  if (error) throw error;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST — process all students with open-ended responses, 5 at a time
export async function POST() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not set in environment variables.' },
      { status: 500 }
    );
  }

  const supabase = serverClient();
  const openai   = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const { data: allProfiles, error: fetchErr } = await supabase
      .from('student_profiles')
      .select('id, extraversion, openness, social_catalyst_score, hope_to_experience, floor_event_idea');

    if (fetchErr) throw fetchErr;

    const profiles: ProfileRow[] = (allProfiles ?? []).filter(
      (p) => (p.hope_to_experience && p.hope_to_experience.trim()) ||
             (p.floor_event_idea    && p.floor_event_idea.trim())
    );

    const skipped = (allProfiles?.length ?? 0) - profiles.length;

    let processed = 0;
    let errors    = 0;

    // Process 5 students concurrently — ~5× faster than sequential
    const CONCURRENT = 5;
    for (let i = 0; i < profiles.length; i += CONCURRENT) {
      const batch   = profiles.slice(i, i + CONCURRENT);
      const results = await Promise.allSettled(
        batch.map(p => processProfile(p, supabase, openai))
      );
      processed += results.filter(r => r.status === 'fulfilled').length;
      errors    += results.filter(r => r.status === 'rejected').length;
    }

    return NextResponse.json({ processed, skipped, errors });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}

// GET — count of students with open-ended responses
export async function GET() {
  const supabase = serverClient();
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('id, hope_to_experience, floor_event_idea');

    if (error) throw error;

    const withResponses = (data ?? []).filter(
      (p) => (p.hope_to_experience && p.hope_to_experience.trim()) ||
             (p.floor_event_idea    && p.floor_event_idea.trim())
    ).length;

    return NextResponse.json({ withResponses, total: data?.length ?? 0 });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}
