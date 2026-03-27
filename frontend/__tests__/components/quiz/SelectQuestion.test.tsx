import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import SelectQuestion from '@/components/quiz/SelectQuestion';
import { QuizQuestion, QuizFormData } from '@/lib/types';

function TestWrapper({ question }: { question: QuizQuestion }) {
  const { control } = useForm<QuizFormData>();
  return <SelectQuestion question={question} control={control} />;
}

const mockSelect: QuizQuestion = {
  id: 'room_type_preference',
  section: 'preferences',
  question: 'Room type preference',
  type: 'select',
  required: true,
  options: [
    { label: 'Single room', value: 'single' },
    { label: 'Suite room', value: 'suite' },
    { label: 'No preference', value: 'no_preference' },
  ],
};

describe('SelectQuestion', () => {
  it('renders options as buttons, not a select element', () => {
    render(<TestWrapper question={mockSelect} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBe(3);
  });

  it('renders all option labels', () => {
    render(<TestWrapper question={mockSelect} />);
    expect(screen.getByText('Single room')).toBeInTheDocument();
    expect(screen.getByText('Suite room')).toBeInTheDocument();
  });

  it('applies selected style when option clicked', () => {
    render(<TestWrapper question={mockSelect} />);
    fireEvent.click(screen.getByText('Single room'));
    expect(screen.getByText('Single room').closest('button')).toHaveClass('bg-purple-primary');
  });
});
