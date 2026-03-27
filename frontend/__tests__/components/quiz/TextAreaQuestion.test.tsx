import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import TextAreaQuestion from '@/components/quiz/TextAreaQuestion';
import { QuizQuestion, QuizFormData } from '@/lib/types';

function TestWrapper({ question }: { question: QuizQuestion }) {
  const { control } = useForm<QuizFormData>();
  return <TextAreaQuestion question={question} control={control} />;
}

const mockText: QuizQuestion = {
  id: 'hope_to_experience',
  section: 'personality',
  question: 'What do you hope to experience?',
  type: 'text',
  required: false,
  placeholder: 'Share your thoughts…',
};

describe('TextAreaQuestion', () => {
  it('renders inside a white card container', () => {
    const { container } = render(<TestWrapper question={mockText} />);
    expect(container.firstChild).toHaveClass('bg-quiz-card');
  });

  it('renders a textarea element', () => {
    render(<TestWrapper question={mockText} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows character count that updates on input', () => {
    render(<TestWrapper question={mockText} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'hello' } });
    expect(screen.getByText(/5 \/ 250/)).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<TestWrapper question={mockText} />);
    expect(screen.getByPlaceholderText('Share your thoughts…')).toBeInTheDocument();
  });
});
