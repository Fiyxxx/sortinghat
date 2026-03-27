import { computePersonalityScores } from '@/lib/scoring';

describe('computePersonalityScores', () => {
  it('computes average extraversion from multiple questions', () => {
    const answers = {
      'floor_chat_silent': 'send_meme',        // extraversion: 0.9
      'ideal_friday_night': 'big_group'        // extraversion: 1.0
    };

    const scores = computePersonalityScores(answers);

    expect(scores.extraversion).toBe(0.95); // (0.9 + 1.0) / 2
  });

  it('computes openness from single question', () => {
    const answers = {
      'international_student_seat': 'excited' // openness: 1.0
    };

    const scores = computePersonalityScores(answers);

    expect(scores.openness).toBe(1.0);
  });

  it('handles slider values for conscientiousness', () => {
    const answers = {
      'dirty_dishes': 0.8 // Slider value maps directly to conscientiousness
    };

    const scores = computePersonalityScores(answers);

    expect(scores.conscientiousness).toBe(0.8);
  });

  it('computes social catalyst score from multiple questions', () => {
    const answers = {
      'floor_chat_silent': 'send_meme' // social_catalyst_score: 0.9
    };

    const scores = computePersonalityScores(answers);

    expect(scores.social_catalyst_score).toBe(0.9);
  });

  it('returns 0 for traits with no answers', () => {
    const answers = {};

    const scores = computePersonalityScores(answers);

    expect(scores.extraversion).toBe(0);
    expect(scores.openness).toBe(0);
    expect(scores.agreeableness).toBe(0);
    expect(scores.conscientiousness).toBe(0);
    expect(scores.social_catalyst_score).toBe(0);
  });
});
