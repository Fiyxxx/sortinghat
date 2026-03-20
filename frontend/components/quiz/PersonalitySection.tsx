'use client';

import { useMemo } from 'react';
import { Control } from 'react-hook-form';
import { QuizFormData } from '@/lib/types';
import { getQuestionsBySection } from '@/lib/quiz-config';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import SliderQuestion from './SliderQuestion';
import TextAreaQuestion from './TextAreaQuestion';

/**
 * PersonalitySection component displays personality-related quiz questions
 * including multiple choice, slider, and text input questions.
 */
interface Props {
  control: Control<QuizFormData>;
}

export default function PersonalitySection({ control }: Props) {
  const questions = useMemo(
    () => getQuestionsBySection('personality'),
    []
  );

  return (
    <section className="space-y-spacing-12" aria-labelledby="personality-heading">
      {/* Section Header */}
      <div className="space-y-spacing-3">
        <h3 id="personality-heading" className="font-display text-headline-md text-on-surface tracking-tight">
          Tell us about your social style
        </h3>
        <p className="text-body-lg text-on-surface/70">
          These questions help us understand your personality and preferences for floor life.
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-spacing-8">
        {questions.map((question) => {
          switch (question.type) {
            case 'multiple_choice':
              return <MultipleChoiceQuestion key={question.id} question={question} control={control} />;
            case 'slider':
              return <SliderQuestion key={question.id} question={question} control={control} />;
            case 'text':
              return <TextAreaQuestion key={question.id} question={question} control={control} />;
            default:
              return null;
          }
        })}
      </div>
    </section>
  );
}
