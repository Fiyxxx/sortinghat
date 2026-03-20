'use client';

import { Chip } from '@/components/ui';

type SectionKey = 'personality' | 'preferences' | 'accessibility';

interface QuizHeaderProps {
  currentSection: SectionKey;
  totalSections: number;
  currentSectionIndex: number;
}

export default function QuizHeader({ currentSection, totalSections, currentSectionIndex }: QuizHeaderProps) {
  const progress = ((currentSectionIndex + 1) / totalSections) * 100;

  const sectionNames: Record<SectionKey, string> = {
    'personality': 'Personality Questions',
    'preferences': 'Preferences',
    'accessibility': 'Accessibility & Special Considerations'
  };

  return (
    <header className="sticky top-0 z-10 bg-surface-container-lowest px-spacing-4 sm:px-spacing-6 py-spacing-4 sm:py-spacing-6">
      <div className="max-w-2xl mx-auto">
        {/* Title and Progress Counter */}
        <div className="flex items-center justify-between mb-spacing-4">
          <h1 className="font-display text-headline-sm sm:text-headline-md tracking-tight text-on-surface">
            Sorting Hat
          </h1>
          <Chip variant="status">
            {currentSectionIndex + 1} of {totalSections}
          </Chip>
        </div>

        {/* Current Section Name */}
        <h2 className="text-title-lg sm:text-headline-sm text-primary mb-spacing-4 sm:mb-spacing-5">
          {sectionNames[currentSection] || currentSection}
        </h2>

        {/* Progress Bar */}
        <div
          className="w-full bg-surface-container-high rounded-full h-1.5 sm:h-2 overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Quiz progress: ${Math.round(progress)}% complete`}
          aria-live="polite"
        >
          <div
            className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </header>
  );
}
