'use client';

import { Control, Controller } from 'react-hook-form';
import { QuizQuestion, QuizFormData } from '@/lib/types';
import Select from '@/components/ui/Select';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
}

export default function SelectQuestion({ question, control }: Props) {
  // Map question options to Select component format with placeholder
  const options = [
    { value: '', label: 'Select an option...' },
    ...(question.options?.map((option) => ({
      value: option.value,
      label: option.label,
    })) || [])
  ];

  return (
    <Controller
      name={`answers.${question.id}`}
      control={control}
      rules={{ required: question.required ? 'Please select an option' : false }}
      render={({ field, fieldState: { error } }) => (
        <Select
          {...field}
          label={question.question}
          options={options}
          error={error?.message}
          required={question.required}
        />
      )}
    />
  );
}
