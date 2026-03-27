import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import SliderQuestion from '@/components/quiz/SliderQuestion';
import { QuizQuestion } from '@/lib/types';

function TestWrapper({ question }: { question: QuizQuestion }) {
  const { control } = useForm();
  return <SliderQuestion question={question} control={control} />;
}

describe('SliderQuestion', () => {
  const mockQuestion: QuizQuestion = {
    id: 'test_slider',
    section: 'preferences',
    question: 'How much do you like coffee?',
    type: 'slider',
    required: true,
    sliderConfig: {
      min: 0,
      max: 1,
      step: 0.1,
      leftLabel: 'Not at all',
      rightLabel: 'Very much'
    }
  };

  it('renders question text', () => {
    render(<TestWrapper question={mockQuestion} />);
    expect(screen.getByText('How much do you like coffee?')).toBeInTheDocument();
  });

  it('renders left and right labels', () => {
    render(<TestWrapper question={mockQuestion} />);
    expect(screen.getByText('Not at all')).toBeInTheDocument();
    expect(screen.getByText('Very much')).toBeInTheDocument();
  });

  it('renders slider input', () => {
    render(<TestWrapper question={mockQuestion} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
  });
});
