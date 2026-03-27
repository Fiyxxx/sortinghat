import { render, screen } from '@testing-library/react';
import QuizHeader from '@/components/quiz/QuizHeader';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

describe('QuizHeader', () => {
  it('displays the question counter', () => {
    render(<QuizHeader currentIndex={2} totalQuestions={12} />);
    expect(screen.getByText('3 / 12')).toBeInTheDocument();
  });

  it('renders the hat tracker image', () => {
    render(<QuizHeader currentIndex={0} totalQuestions={12} />);
    expect(screen.getByAltText('progress tracker')).toBeInTheDocument();
  });

  it('renders progress bar with correct aria attributes', () => {
    render(<QuizHeader currentIndex={5} totalQuestions={12} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '6');
    expect(bar).toHaveAttribute('aria-valuemax', '12');
  });
});
