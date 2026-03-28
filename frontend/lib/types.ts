// Personality scores (0.0 to 1.0)
export interface PersonalityScores {
  extraversion: number;
  openness: number;
  agreeableness: number;
  conscientiousness: number;
  social_catalyst_score: number;
}

// Quiz question configuration
export interface QuizOption {
  label: string;
  value: string;
  scores?: Partial<PersonalityScores>;
}

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  leftLabel: string;
  rightLabel: string;
}

export type QuestionType =
  | 'multiple_choice'
  | 'slider'
  | 'text'
  | 'select'
  | 'checkbox';

export type QuestionSection =
  | 'personality'
  | 'preferences'
  | 'accessibility';

export interface QuizQuestion {
  id: string;
  section: QuestionSection;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: QuizOption[];
  sliderConfig?: SliderConfig;
  placeholder?: string;
}

// Form data structure
export interface QuizFormData {
  // Raw answers from questions
  answers: Record<string, string | number>;

  // Preferences
  room_type_preference: string;
  gender_floor_preference: string;
  sleep_schedule: number;

  // Open-ended
  hope_to_experience?: string;
  floor_event_idea?: string;

  // Accessibility
  requires_accessibility?: boolean;
}

// Database payload
export interface StudentProfile {
  // Identity
  nus_id: string;

  // Admissions data (pre-filled, not from quiz)
  faculty: string;
  race: string;

  // Personality scores
  extraversion: number;
  openness: number;
  agreeableness: number;
  conscientiousness: number;
  social_catalyst_score: number;

  // Preferences
  room_type_preference: string;
  gender_floor_preference: string;
  sleep_schedule: number;

  // Open-ended
  hope_to_experience: string | null;
  floor_event_idea: string | null;

  // Accessibility
  requires_accessibility: boolean;

  // Raw responses backup
  raw_responses: Record<string, string | number>;
}
