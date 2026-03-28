'use client';

import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';
import { DIRECT_FIELDS } from '@/lib/quiz-config';

// Maps 0–1 to 9:00 PM–3:00 AM (6-hour range), snapped to nearest 30 minutes
function formatSleepTime(value: number): string {
  const totalMinutes = Math.round(value * 360);
  const snapped = Math.round(totalMinutes / 30) * 30;
  const hour24 = (21 + Math.floor(snapped / 60)) % 24;
  const mins = snapped % 60;
  const ampm = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  return `${hour12}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

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
            <div className="relative pt-10">
              {/* Value pill above thumb */}
              <div
                className="absolute top-0 pointer-events-none -translate-x-1/2"
                style={{ left: `${percent}%` }}
              >
                <span className="block text-center bg-purple-primary text-white text-base font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
                  {question.id === 'sleep_schedule' ? formatSleepTime(value) : `${Math.round(percent)}%`}
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
              <span className="text-sm text-ink-muted">{leftLabel}</span>
              <span className="text-sm text-ink-muted">{rightLabel}</span>
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
          </div>
        );
      }}
    />
  );
}
