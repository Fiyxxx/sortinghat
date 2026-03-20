'use client';

import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';
import Checkbox from '@/components/ui/Checkbox';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
}

export default function CheckboxQuestion({ question, control }: Props) {
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
        defaultValue={false}
        rules={{ required: question.required ? 'This field is required' : false }}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-4">
            <Checkbox
              checked={field.value as boolean}
              onChange={field.onChange}
              aria-label={question.question}
            />

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
