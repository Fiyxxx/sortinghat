import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import MultipleChoiceQuestion from '@/components/quiz/MultipleChoiceQuestion';
import { QuizQuestion } from '@/lib/types';

// Wrapper component to provide form context
function TestWrapper({ question }: { question: QuizQuestion }) {
  const { control } = useForm();
  return <MultipleChoiceQuestion question={question} control={control} />;
}

describe('MultipleChoiceQuestion', () => {
  const mockQuestion: QuizQuestion = {
    id: 'test_question',
    section: 'personality',
    question: 'What is your favorite color?',
    type: 'multiple_choice',
    required: true,
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
      { label: 'Green', value: 'green' }
    ]
  };

  it('renders question text', () => {
    render(<TestWrapper question={mockQuestion} />);
    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<TestWrapper question={mockQuestion} />);
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
  });

  it('allows selecting an option', () => {
    render(<TestWrapper question={mockQuestion} />);
    const redButton = screen.getByText('Red');
    fireEvent.click(redButton);
    // Visual feedback test would go here (checking for selected state)
  });

  it('applies selected styles when option is chosen', () => {
    render(<TestWrapper question={mockQuestion} />);
    const redButton = screen.getByText('Red');
    fireEvent.click(redButton);
    expect(redButton.closest('button')).toHaveClass('bg-purple-primary');
  });

  it('renders options as buttons, not radio inputs', () => {
    render(<TestWrapper question={mockQuestion} />);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBe(3);
  });
});
