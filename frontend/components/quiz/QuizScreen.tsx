'use client';

import { Control } from 'react-hook-form';
import { motion } from 'framer-motion';
import { QuizQuestion, QuizFormData } from '@/lib/types';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import SliderQuestion from './SliderQuestion';
import TextAreaQuestion from './TextAreaQuestion';
import SelectQuestion from './SelectQuestion';
import CheckboxQuestion from './CheckboxQuestion';

interface Props {
  question: QuizQuestion;
  control: Control<QuizFormData>;
  direction: number; // 1 = forward, -1 = backward
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

function renderQuestion(question: QuizQuestion, control: Control<QuizFormData>) {
  switch (question.type) {
    case 'multiple_choice': return <MultipleChoiceQuestion question={question} control={control} />;
    case 'slider':          return <SliderQuestion question={question} control={control} />;
    case 'text':            return <TextAreaQuestion question={question} control={control} />;
    case 'select':          return <SelectQuestion question={question} control={control} />;
    case 'checkbox':        return <CheckboxQuestion question={question} control={control} />;
    default:                return null;
  }
}

export default function QuizScreen({ question, control, direction }: Props) {
  return (
    <motion.div
      key={question.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col px-6 pt-36 pb-32 min-h-screen"
    >
      <p className="text-xs font-semibold tracking-widest text-ink-muted uppercase mb-6">
        {question.section.toUpperCase()}
      </p>
      <h2 className="text-[3.5rem] font-bold text-ink-primary mb-8 leading-snug">
        {question.question}
      </h2>
      {renderQuestion(question, control)}
    </motion.div>
  );
}
