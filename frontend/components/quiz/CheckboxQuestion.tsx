'use client';

import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
}

export default function CheckboxQuestion({ question, control }: Props) {
  const fieldName = question.id as keyof QuizFormData;

  return (
    <Controller
      name={fieldName}
      control={control}
      rules={{ required: question.required ? 'This field is required' : false }}
      render={({ field, fieldState: { error } }) => (
        <div
          className="bg-quiz-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-5
                     flex items-center gap-4 cursor-pointer"
          onClick={() => field.onChange(!field.value)}
        >
          {/* Visible custom checkbox */}
          <div
            className={[
              'w-5 h-5 rounded border-2 border-purple-primary flex-shrink-0',
              'flex items-center justify-center transition-colors',
              field.value ? 'bg-purple-primary' : 'bg-white',
            ].join(' ')}
            aria-hidden="true"
          >
            {field.value && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <span className="text-base font-medium text-ink-primary flex-1">
            {question.question}
          </span>

          {/* Hidden input for accessible role and form value */}
          <input
            type="checkbox"
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            className="sr-only"
            aria-label={question.question}
          />

          {error && <p className="text-sm text-red-500 ml-auto">{error.message}</p>}
        </div>
      )}
    />
  );
}
