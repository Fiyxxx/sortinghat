'use client';

import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
}

export default function MultipleChoiceQuestion({ question, control }: Props) {
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
        rules={{ required: question.required ? 'Please select an option' : false }}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-4">
            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {question.options?.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => field.onChange(option.value)}
                  className={`
                    w-full text-left px-5 py-4 rounded-lg transition-all
                    font-body text-body-lg
                    ${field.value === option.value
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
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
