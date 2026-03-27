import { QuizQuestion } from './types';

export const quizQuestions: QuizQuestion[] = [
  // ===== PERSONALITY SECTION =====
  {
    id: 'floor_chat_silent',
    section: 'personality',
    question: 'Your floor group chat is dead silent. What do you do?',
    type: 'multiple_choice',
    required: true,
    options: [
      {
        label: 'Send a meme and suggest supper',
        value: 'send_meme',
        scores: {
          extraversion: 0.9,
          agreeableness: 0.8,
          social_catalyst_score: 0.9
        }
      },
      {
        label: "Message one person you're close with privately",
        value: 'private_message',
        scores: {
          extraversion: 0.3,
          agreeableness: 0.7,
          social_catalyst_score: 0.3
        }
      },
      {
        label: 'Enjoy the peace and quiet',
        value: 'enjoy_peace',
        scores: {
          extraversion: 0.2,
          agreeableness: 0.4,
          social_catalyst_score: 0.1
        }
      },
      {
        label: 'Post a poll asking if people want to do something this weekend',
        value: 'post_poll',
        scores: {
          extraversion: 0.8,
          agreeableness: 0.6,
          social_catalyst_score: 0.8
        }
      }
    ]
  },

  {
    id: 'dirty_dishes',
    section: 'personality',
    question: 'Someone left dirty dishes in the shared kitchen overnight. Your move?',
    type: 'slider',
    required: true,
    sliderConfig: {
      min: 0,
      max: 1,
      step: 0.1,
      leftLabel: "Not my problem, I'd ignore it",
      rightLabel: "I'd clean it myself and leave a polite note"
    }
  },

  {
    id: 'international_student_seat',
    section: 'personality',
    question: "You're at a floor dinner and the only open seat is next to someone who speaks a different language and is from a country you know nothing about. How do you feel?",
    type: 'multiple_choice',
    required: true,
    options: [
      {
        label: 'Excited — I love learning about new cultures',
        value: 'excited',
        scores: { openness: 1.0 }
      },
      {
        label: "Comfortable — I'd make small talk",
        value: 'comfortable',
        scores: { openness: 0.7 }
      },
      {
        label: "A bit awkward — but I'd try",
        value: 'awkward',
        scores: { openness: 0.4 }
      },
      {
        label: "I'd look for another seat",
        value: 'avoid',
        scores: { openness: 0.1 }
      }
    ]
  },

  {
    id: 'ideal_friday_night',
    section: 'personality',
    question: 'Ideal Friday night on campus?',
    type: 'multiple_choice',
    required: true,
    options: [
      {
        label: 'Big group outing / party',
        value: 'big_group',
        scores: { extraversion: 1.0 }
      },
      {
        label: 'Small gathering (3–5 friends), board games or cooking together',
        value: 'small_group',
        scores: { extraversion: 0.6 }
      },
      {
        label: 'Chill 1-on-1 dinner or walk with a close friend',
        value: 'one_on_one',
        scores: { extraversion: 0.3 }
      },
      {
        label: 'Solo — movie, gaming, reading in my room',
        value: 'solo',
        scores: { extraversion: 0.1 }
      }
    ]
  },

  {
    id: 'hope_to_experience',
    section: 'personality',
    question: "What's one thing you hope to experience in RC life that you can't get anywhere else?",
    type: 'text',
    required: false,
    placeholder: 'Share your thoughts... (250 characters recommended)'
  },

  {
    id: 'floor_event_idea',
    section: 'personality',
    question: 'If you could organize one event or activity for your floor, what would it be?',
    type: 'text',
    required: false,
    placeholder: 'Share your ideas... (250 characters recommended)'
  },

  // ===== PREFERENCES SECTION =====
  {
    id: 'room_type_preference',
    section: 'preferences',
    question: 'Room type preference',
    type: 'select',
    required: true,
    options: [
      { label: 'Single room', value: 'single' },
      { label: 'Suite room (shared common area)', value: 'suite' },
      { label: 'No preference', value: 'no_preference' }
    ]
  },

  {
    id: 'gender_floor_preference',
    section: 'preferences',
    question: 'Gender floor preference',
    type: 'select',
    required: true,
    options: [
      { label: 'Same-gender floor', value: 'same' },
      { label: 'Mixed-gender floor', value: 'mixed' },
      { label: 'No preference', value: 'no_preference' }
    ]
  },

  {
    id: 'sleep_schedule',
    section: 'preferences',
    question: 'When do you usually go to sleep?',
    type: 'slider',
    required: true,
    sliderConfig: {
      min: 0,
      max: 1,
      step: 0.1,
      leftLabel: 'Early bird (9-10pm)',
      rightLabel: 'Night owl (2am+)'
    }
  },

  {
    id: 'noise_tolerance',
    section: 'preferences',
    question: 'How do you feel about noise?',
    type: 'slider',
    required: true,
    sliderConfig: {
      min: 0,
      max: 1,
      step: 0.1,
      leftLabel: 'I need silence to function',
      rightLabel: "Noise doesn't bother me at all"
    }
  },

  {
    id: 'aircon_usage',
    section: 'preferences',
    question: 'Aircon usage tendency',
    type: 'select',
    required: true,
    options: [
      { label: 'Heavy user (always on)', value: 'heavy' },
      { label: 'Moderate (situational)', value: 'moderate' },
      { label: 'Rarely use', value: 'rarely' },
      { label: 'No preference', value: 'no_preference' }
    ]
  },

  // ===== ACCESSIBILITY SECTION =====
  {
    id: 'requires_accessibility',
    section: 'accessibility',
    question: 'I require a wheelchair-accessible room',
    type: 'checkbox',
    required: false
  }
];

// Helper to get questions by section
export function getQuestionsBySection(section: string) {
  return quizQuestions.filter(q => q.section === section);
}

// Helper to get question by ID
export function getQuestionById(id: string) {
  return quizQuestions.find(q => q.id === id);
}

// NOTE: This file is ~235 lines for 12 questions. For Phase 1, this is acceptable.
// For Phase 2+, consider splitting by section:
// - personality-questions.ts
// - preference-questions.ts
// - accessibility-questions.ts
// Or migrating to database-driven questions (see spec: Future Enhancement section).
