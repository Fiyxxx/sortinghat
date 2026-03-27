// frontend/__tests__/components/quiz/SliderQuestion.test.tsx
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import SliderQuestion from '@/components/quiz/SliderQuestion';
import { QuizQuestion, QuizFormData } from '@/lib/types';

function TestWrapper({ question }: { question: QuizQuestion }) {
  const { control } = useForm<QuizFormData>({
    defaultValues: { answers: { dirty_dishes: 0.5 }, sleep_schedule: 0.5 },
  });
  return <SliderQuestion question={question} control={control} />;
}

const personalitySlider: QuizQuestion = {
  id: 'dirty_dishes',
  section: 'personality',
  question: 'Dirty dishes question',
  type: 'slider',
  required: true,
  sliderConfig: { min: 0, max: 1, step: 0.1, leftLabel: 'Ignore it', rightLabel: 'Clean it' },
};

const preferenceSlider: QuizQuestion = {
  id: 'sleep_schedule',
  section: 'preferences',
  question: 'Sleep schedule',
  type: 'slider',
  required: true,
  sliderConfig: { min: 0, max: 1, step: 0.1, leftLabel: 'Early bird', rightLabel: 'Night owl' },
};

describe('SliderQuestion', () => {
  it('renders left and right labels for personality slider', () => {
    render(<TestWrapper question={personalitySlider} />);
    expect(screen.getByText('Ignore it')).toBeInTheDocument();
    expect(screen.getByText('Clean it')).toBeInTheDocument();
  });

  it('renders inside a white card container', () => {
    const { container } = render(<TestWrapper question={personalitySlider} />);
    expect(container.firstChild).toHaveClass('bg-quiz-card');
  });

  it('uses a native range input (not design-system Slider)', () => {
    render(<TestWrapper question={personalitySlider} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders left and right labels for preference slider', () => {
    render(<TestWrapper question={preferenceSlider} />);
    expect(screen.getByText('Early bird')).toBeInTheDocument();
    expect(screen.getByText('Night owl')).toBeInTheDocument();
  });
});
