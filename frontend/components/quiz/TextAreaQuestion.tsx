'use client';

import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';
import { useState } from 'react';
import TextArea from '@/components/ui/TextArea';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
}

export default function TextAreaQuestion({ question, control }: Props) {
  const [charCount, setCharCount] = useState(0);
  const recommendedLength = 250;

  return (
    <Controller
      name={`answers.${question.id}`}
      control={control}
      rules={{ required: question.required ? 'Please provide an answer' : false }}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <TextArea
            {...field}
            label={question.question}
            rows={4}
            placeholder={question.placeholder}
            onChange={(e) => {
              field.onChange(e);
              setCharCount(e.target.value.length);
            }}
            error={error?.message}
            required={question.required}
          />

          <div className="font-body text-body-sm text-on-surface/60">
            {charCount} / {recommendedLength} characters {charCount < recommendedLength ? 'recommended' : ''}
          </div>
        </div>
      )}
    />
  );
}
