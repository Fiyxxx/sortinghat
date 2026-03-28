import { z } from 'zod';

// Schema for quiz form data
// Note: Individual question validation (required/optional) is handled
// by Controller components in the form, not by this schema
export const quizFormSchema = z.object({
  // Raw answers from questions (dynamic based on quiz config)
  answers: z.record(z.string(), z.union([z.string(), z.number()])),

  // Preferences - all required
  room_type_preference: z.string().min(1, 'Please select a room type'),
  gender_floor_preference: z.string().min(1, 'Please select a preference'),
  sleep_schedule: z.number().min(0).max(1),

  // Open-ended - optional
  hope_to_experience: z.string().optional(),
  floor_event_idea: z.string().optional(),

  // Accessibility - defaults to false
  requires_accessibility: z.boolean().default(false)
});

export type QuizFormSchema = z.infer<typeof quizFormSchema>;
