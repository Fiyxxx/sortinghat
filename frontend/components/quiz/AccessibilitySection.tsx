'use client';

import { useMemo } from 'react';
import { Control } from 'react-hook-form';
import { QuizFormData } from '@/lib/types';
import { getQuestionsBySection } from '@/lib/quiz-config';
import CheckboxQuestion from './CheckboxQuestion';

/**
 * AccessibilitySection component displays accessibility-related quiz questions
 * to gather information about specific room requirements.
 */
interface Props {
  control: Control<QuizFormData>;
}

export default function AccessibilitySection({ control }: Props) {
  const questions = useMemo(
    () => getQuestionsBySection('accessibility'),
    []
  );

  return (
    <section className="space-y-spacing-12" aria-labelledby="accessibility-heading">
      {/* Section Header */}
      <div className="space-y-spacing-3">
        <h3 id="accessibility-heading" className="font-display text-headline-md text-on-surface tracking-tight">
          Accessibility needs
        </h3>
        <p className="text-body-lg text-on-surface/70">
          Let us know if you have any specific room requirements.
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-spacing-8">
        {questions.map((question) => {
          if (question.type === 'checkbox') {
            return <CheckboxQuestion key={question.id} question={question} control={control} />;
          }
          return null;
        })}
      </div>
    </section>
  );
}
