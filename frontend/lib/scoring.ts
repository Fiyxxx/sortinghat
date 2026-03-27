import { PersonalityScores } from './types';
import { quizQuestions } from './quiz-config';

/**
 * Computes Big Five personality scores from quiz answers.
 *
 * Strategy:
 * - For each personality trait, find all questions that measure it
 * - Average the scores from those questions
 * - Return scores normalized to 0.0-1.0 range
 *
 * Special cases:
 * - Slider questions: value maps directly to the trait (e.g., dirty_dishes → conscientiousness)
 * - Multiple choice: scores defined in option.scores
 * - If no questions measure a trait, return 0
 */
export function computePersonalityScores(
  answers: Record<string, string | number>
): PersonalityScores {
  const traits: Array<keyof PersonalityScores> = [
    'extraversion',
    'openness',
    'agreeableness',
    'conscientiousness',
    'social_catalyst_score'
  ];

  const scores: PersonalityScores = {
    extraversion: 0,
    openness: 0,
    agreeableness: 0,
    conscientiousness: 0,
    social_catalyst_score: 0
  };

  // For each trait, collect all scores and average them
  traits.forEach(trait => {
    const traitScores: number[] = [];

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = quizQuestions.find(q => q.id === questionId);
      if (!question) return;

      // Handle slider questions (special mapping)
      if (question.type === 'slider' && typeof answer === 'number') {
        // dirty_dishes slider → conscientiousness
        if (questionId === 'dirty_dishes' && trait === 'conscientiousness') {
          traitScores.push(answer);
        }
      }

      // Handle multiple choice questions
      if (question.type === 'multiple_choice' && typeof answer === 'string') {
        const option = question.options?.find(opt => opt.value === answer);
        if (option?.scores && option.scores[trait] !== undefined) {
          traitScores.push(option.scores[trait]!);
        }
      }
    });

    // Compute average for this trait
    if (traitScores.length > 0) {
      scores[trait] = traitScores.reduce((sum, val) => sum + val, 0) / traitScores.length;
    }
  });

  return scores;
}
