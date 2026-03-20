'use client';

import { useMemo } from 'react';
import { Control } from 'react-hook-form';
import { QuizFormData } from '@/lib/types';
import { getQuestionsBySection } from '@/lib/quiz-config';
import SelectQuestion from './SelectQuestion';
import SliderQuestion from './SliderQuestion';

/**
 * PreferencesSection component displays living preference quiz questions
 * including select and slider questions.
 */
interface Props {
  control: Control<QuizFormData>;
}

export default function PreferencesSection({ control }: Props) {
  const questions = useMemo(
    () => getQuestionsBySection('preferences'),
    []
  );

  return (
    <section className="space-y-spacing-12" aria-labelledby="preferences-heading">
      {/* Section Header */}
      <div className="space-y-spacing-3">
        <h3 id="preferences-heading" className="font-display text-headline-md text-on-surface tracking-tight">
          Your living preferences
        </h3>
        <p className="text-body-lg text-on-surface/70">
          Help us match you with compatible floormates.
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-spacing-8">
        {questions.map((question) => {
          switch (question.type) {
            case 'select':
              return <SelectQuestion key={question.id} question={question} control={control} />;
            case 'slider':
              return <SliderQuestion key={question.id} question={question} control={control} />;
            default:
              return null;
          }
        })}
      </div>
    </section>
  );
}
