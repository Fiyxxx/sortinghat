'use client';

import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';
import Slider from '@/components/ui/Slider';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
}

export default function SliderQuestion({ question, control }: Props) {
  if (!question.sliderConfig) {
    throw new Error('SliderQuestion requires sliderConfig');
  }

  const { min, max, step, leftLabel, rightLabel } = question.sliderConfig;

  return (
    <div className="space-y-6">
      {/* Question Label */}
      <h3 className="font-display text-title-md text-on-surface">
        {question.question}
        {question.required && <span className="text-error ml-1">*</span>}
      </h3>

      <Controller
        name={`answers.${question.id}`}
        control={control}
        defaultValue={(min + max) / 2}
        rules={{ required: question.required ? 'Please select a value' : false }}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-4">
            {/* Design System Slider */}
            <Slider
              value={typeof field.value === 'number' ? field.value : (min + max) / 2}
              onChange={field.onChange}
              min={min}
              max={max}
              step={step}
              label={question.question}
              showValue={true}
              valueFormatter={(value) => {
                const percentage = ((value - min) / (max - min)) * 100;
                return `${Math.round(percentage)}%`;
              }}
            />

            {/* Left/Right Labels */}
            <div className="flex justify-between items-center gap-4">
              <span className="font-body text-body-sm text-on-surface/60 text-left flex-1">
                {leftLabel}
              </span>
              <span className="font-body text-body-sm text-on-surface/60 text-right flex-1">
                {rightLabel}
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <p className="font-body text-label-sm text-error">{error.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
}
