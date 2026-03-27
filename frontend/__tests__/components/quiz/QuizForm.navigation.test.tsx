// frontend/__tests__/components/quiz/QuizForm.navigation.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/lib/supabase', () => ({
  supabase: { from: () => ({ insert: () => Promise.resolve({ error: null }) }) },
}));

import QuizForm from '@/components/quiz/QuizForm';

describe('QuizForm navigation', () => {
  it('renders first question on load', () => {
    render(<QuizForm />);
    expect(screen.getByText(/floor group chat/i)).toBeInTheDocument();
  });

  it('shows Next button disabled when no answer selected', () => {
    render(<QuizForm />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('enables Next after selecting a multiple-choice option', () => {
    render(<QuizForm />);
    fireEvent.click(screen.getByText(/Send a meme/i));
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('advances to second question on Next click', async () => {
    render(<QuizForm />);
    fireEvent.click(screen.getByText(/Send a meme/i));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText(/dirty dishes/i)).toBeInTheDocument();
    });
  });

  it('shows Back button from question 2 onward', async () => {
    render(<QuizForm />);
    fireEvent.click(screen.getByText(/Send a meme/i));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });
});
