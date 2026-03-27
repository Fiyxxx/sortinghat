'use client';

import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';
import { DIRECT_FIELDS } from '@/lib/quiz-config';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
}

export default function TextAreaQuestion({ question, control }: Props) {
  const [charCount, setCharCount] = useState(0);
  const recommended = 250;

  const fieldName = DIRECT_FIELDS.has(question.id)
    ? (question.id as keyof QuizFormData)
    : (`answers.${question.id}` as const);

  return (
    <Controller
      name={fieldName}
      control={control}
      rules={{ required: question.required ? 'Please provide an answer' : false }}
      render={({ field, fieldState: { error } }) => (
        <div className="bg-quiz-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
          <textarea
            {...field}
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={(e) => {
              field.onChange(e);
              setCharCount(e.target.value.length);
            }}
            placeholder={question.placeholder || 'Share your thoughts…'}
            rows={4}
            className="w-full bg-transparent resize-none outline-none text-base text-ink-primary
                       placeholder:text-ink-muted min-h-[120px] focus:ring-1 focus:ring-purple-primary/40"
            aria-label={question.question}
          />
          <div className="flex justify-between items-center mt-2">
            {error
              ? <p className="text-sm text-red-500">{error.message}</p>
              : <span />
            }
            <span className="text-xs text-ink-muted">{charCount} / {recommended}</span>
          </div>
        </div>
      )}
    />
  );
}
