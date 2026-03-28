'use client';

import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
}

export default function MultipleChoiceQuestion({ question, control }: Props) {
  return (
    <Controller
      name={`answers.${question.id}`}
      control={control}
      rules={{ required: question.required ? 'Please select an option' : false }}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-3">
          {question.options?.map((option) => {
            const selected = field.value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => field.onChange(option.value)}
                className={[
                  'w-full text-left px-5 py-4 rounded-2xl transition-all duration-150',
                  'text-xl font-medium shadow-[0_2px_12px_rgba(0,0,0,0.07)]',
                  selected
                    ? 'bg-purple-primary text-white scale-[1.02]'
                    : 'bg-quiz-card text-ink-primary hover:bg-purple-light/40',
                ].join(' ')}
              >
                {option.label}
              </button>
            );
          })}
          {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
        </div>
      )}
    />
  );
}
