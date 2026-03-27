import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import SectionInterstitial from '@/components/quiz/SectionInterstitial';

describe('SectionInterstitial', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders the personality→preferences interstitial', () => {
    render(<SectionInterstitial trigger="personality-to-preferences" onComplete={jest.fn()} />);
    expect(screen.getByText(/Now, let's talk practicalities/i)).toBeInTheDocument();
    expect(screen.getByText(/living preferences/i)).toBeInTheDocument();
  });

  it('renders the preferences→accessibility interstitial', () => {
    render(<SectionInterstitial trigger="preferences-to-accessibility" onComplete={jest.fn()} />);
    expect(screen.getByText(/Almost done/i)).toBeInTheDocument();
    expect(screen.getByText(/One last thing/i)).toBeInTheDocument();
  });

  it('calls onComplete after 1500ms', () => {
    const onComplete = jest.fn();
    render(<SectionInterstitial trigger="personality-to-preferences" onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(1500); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete on click', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onComplete = jest.fn();
    const { container } = render(
      <SectionInterstitial trigger="personality-to-preferences" onComplete={onComplete} />
    );
    await user.click(container.firstChild as HTMLElement);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
