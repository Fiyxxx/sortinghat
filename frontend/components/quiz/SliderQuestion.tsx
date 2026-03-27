'use client';

import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';
import { DIRECT_FIELDS } from '@/lib/quiz-config';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
}

export default function SliderQuestion({ question, control }: Props) {
  if (!question.sliderConfig) throw new Error('SliderQuestion requires sliderConfig');
  const { min, max, step, leftLabel, rightLabel } = question.sliderConfig;

  const fieldName = DIRECT_FIELDS.has(question.id)
    ? (question.id as keyof QuizFormData)
    : (`answers.${question.id}` as const);

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={(min + max) / 2}
      rules={{ required: question.required ? 'Please select a value' : false }}
      render={({ field, fieldState: { error } }) => {
        const value = typeof field.value === 'number' ? field.value : (min + max) / 2;
        const percent = ((value - min) / (max - min)) * 100;

        return (
          <div className="bg-quiz-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <div className="relative pt-8">
              {/* Value pill above thumb */}
              <div
                className="absolute top-0 pointer-events-none"
                style={{ left: `calc(${percent}% - 20px)`, width: '40px' }}
              >
                <span className="block text-center bg-purple-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {Math.round(percent)}%
                </span>
              </div>

              {/* Track */}
              <div className="relative h-1 bg-purple-light rounded-full">
                <div
                  className="absolute left-0 top-0 h-full bg-purple-primary rounded-full"
                  style={{ width: `${percent}%` }}
                />
                {/* Invisible wide hit-target input */}
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                  aria-label={question.question}
                />
                {/* Visible thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-purple-primary rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] pointer-events-none"
                  style={{ left: `calc(${percent}% - 10px)` }}
                />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <span className="text-xs text-ink-muted">{leftLabel}</span>
              <span className="text-xs text-ink-muted">{rightLabel}</span>
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
          </div>
        );
      }}
    />
  );
}
