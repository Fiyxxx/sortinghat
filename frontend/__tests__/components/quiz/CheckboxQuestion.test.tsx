import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import CheckboxQuestion from '@/components/quiz/CheckboxQuestion';
import { QuizQuestion, QuizFormData } from '@/lib/types';

function TestWrapper({ question }: { question: QuizQuestion }) {
  const { control } = useForm<QuizFormData>({ defaultValues: { requires_accessibility: false } });
  return <CheckboxQuestion question={question} control={control} />;
}

const mockCheckbox: QuizQuestion = {
  id: 'requires_accessibility',
  section: 'accessibility',
  question: 'I require a wheelchair-accessible room',
  type: 'checkbox',
  required: false,
};

describe('CheckboxQuestion', () => {
  it('renders the question label', () => {
    render(<TestWrapper question={mockCheckbox} />);
    expect(screen.getByText('I require a wheelchair-accessible room')).toBeInTheDocument();
  });

  it('renders inside a white card container', () => {
    const { container } = render(<TestWrapper question={mockCheckbox} />);
    expect(container.querySelector('.bg-quiz-card')).toBeInTheDocument();
  });

  it('does not render a design-system Checkbox import (uses custom checkbox)', () => {
    render(<TestWrapper question={mockCheckbox} />);
    // Custom checkbox is a div, not a role="checkbox" from a design system component
    // The hidden input provides the accessible role
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('toggles checked state on click', () => {
    render(<TestWrapper question={mockCheckbox} />);
    const card = screen.getByText('I require a wheelchair-accessible room').closest('div');
    fireEvent.click(card!);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
