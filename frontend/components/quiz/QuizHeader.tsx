'use client';

import Image from 'next/image';

interface QuizHeaderProps {
  currentIndex: number;   // 0-based question index
  totalQuestions: number; // 12
}

export default function QuizHeader({ currentIndex, totalQuestions }: QuizHeaderProps) {
  const rawPercent = currentIndex / (totalQuestions - 1);
  const hatLeftStyle =
    currentIndex === 0
      ? '0px'
      : currentIndex === totalQuestions - 1
      ? 'calc(100% - 28px)'
      : `calc(${rawPercent * 100}% - 14px)`;

  return (
    <div className="fixed top-0 left-0 right-0 z-20 px-6">
      <div
        className="relative w-full bg-purple-light"
        style={{ height: '4px' }}
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
        aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}
      >
        {/* Fill */}
        <div
          className="absolute left-0 top-0 h-full bg-purple-primary transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
        {/* Hat tracker */}
        <div
          className="absolute -top-3 transition-[left] duration-300 ease-out"
          style={{ left: hatLeftStyle }}
        >
          <Image
            src="/sorting-hat.png"
            alt="progress tracker"
            width={28}
            height={28}
            className="select-none"
          />
        </div>
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-sm font-medium text-ink-muted" aria-hidden="true">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>
    </div>
  );
}
