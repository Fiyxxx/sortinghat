// frontend/__tests__/components/quiz/QuizScreen.test.tsx
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import QuizScreen from '@/components/quiz/QuizScreen';
import { QuizQuestion, QuizFormData } from '@/lib/types';

function TestWrapper({ question }: { question: QuizQuestion }) {
  const { control } = useForm<QuizFormData>();
  return <QuizScreen question={question} control={control} direction={1} />;
}

describe('QuizScreen', () => {
  it('displays the section label in uppercase', () => {
    const q: QuizQuestion = {
      id: 'floor_chat_silent', section: 'personality', question: 'What do you do?',
      type: 'multiple_choice', required: true,
      options: [{ label: 'A', value: 'a' }],
    };
    render(<TestWrapper question={q} />);
    expect(screen.getByText('PERSONALITY')).toBeInTheDocument();
  });

  it('displays the question text', () => {
    const q: QuizQuestion = {
      id: 'floor_chat_silent', section: 'personality', question: 'What do you do?',
      type: 'multiple_choice', required: true,
      options: [{ label: 'A', value: 'a' }],
    };
    render(<TestWrapper question={q} />);
    expect(screen.getByText('What do you do?')).toBeInTheDocument();
  });

  it('renders multiple_choice option cards', () => {
    const q: QuizQuestion = {
      id: 'test', section: 'personality', question: 'Pick one',
      type: 'multiple_choice', required: true,
      options: [{ label: 'Option A', value: 'a' }],
    };
    render(<TestWrapper question={q} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('renders slider endpoint labels', () => {
    const q: QuizQuestion = {
      id: 'dirty_dishes', section: 'personality', question: 'Slider Q',
      type: 'slider', required: true,
      sliderConfig: { min: 0, max: 1, step: 0.1, leftLabel: 'Left', rightLabel: 'Right' },
    };
    render(<TestWrapper question={q} />);
    expect(screen.getByText('Left')).toBeInTheDocument();
  });
});
