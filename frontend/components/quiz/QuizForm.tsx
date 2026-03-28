'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { QuizFormData, StudentProfile } from '@/lib/types';
import { quizFormSchema } from '@/lib/validation';
import { computePersonalityScores } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';
import { saveFormDraft, clearFormDraft } from '@/lib/form-storage';
import { quizQuestions, DIRECT_FIELDS } from '@/lib/quiz-config';
import QuizHeader from './QuizHeader';
import QuizScreen from './QuizScreen';
import SectionInterstitial from './SectionInterstitial';

type InterstitialKey = 'personality-to-preferences' | 'preferences-to-accessibility';

const INTERSTITIAL_AFTER: Record<number, InterstitialKey> = {
  5: 'personality-to-preferences',
  8: 'preferences-to-accessibility',
};

const TOTAL = quizQuestions.length; // 12

interface QuizFormProps {
  nusId:   string;
  faculty: string;
  race:    string;
}

export default function QuizForm({ nusId, faculty, race }: QuizFormProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [interstitial, setInterstitial] = useState<InterstitialKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      answers: {},
      room_type_preference: '',
      gender_floor_preference: '',
      sleep_schedule: 0.5,
      hope_to_experience: '',
      floor_event_idea: '',
      requires_accessibility: false,
    },
  });

  useEffect(() => {
    const sub = watch((data) => saveFormDraft(data));
    return () => sub.unsubscribe();
  }, [watch]);

  const currentQuestion = quizQuestions[currentIndex];
  const watchedAnswers = watch('answers');
  const watchedAll = watch();

  const isAnswered = (() => {
    const q = currentQuestion;
    if (q.type === 'multiple_choice') return !!watchedAnswers?.[q.id];
    // select fields always bind to top-level QuizFormData keys (see DIRECT_FIELDS in quiz-config)
    if (q.type === 'select') return !!(watchedAll as unknown as Record<string, unknown>)[q.id];
    if (q.type === 'slider') return true;
    if (q.type === 'text') return true;
    if (q.type === 'checkbox') return true;
    return false;
  })();

  const goNext = useCallback(() => {
    if (INTERSTITIAL_AFTER[currentIndex] != null) {
      setDirection(1);
      setInterstitial(INTERSTITIAL_AFTER[currentIndex]);
    } else {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const onInterstitialComplete = useCallback(() => {
    setInterstitial(null);
    setDirection(1);
    setCurrentIndex((i) => i + 1);
  }, []);

  const onSubmit = async (data: QuizFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const scores = computePersonalityScores(data.answers);
      const payload: StudentProfile = {
        nus_id: nusId,
        faculty,
        race,
        extraversion: scores.extraversion,
        openness: scores.openness,
        agreeableness: scores.agreeableness,
        conscientiousness: scores.conscientiousness,
        social_catalyst_score: scores.social_catalyst_score,
        room_type_preference: data.room_type_preference,
        gender_floor_preference: data.gender_floor_preference,
        sleep_schedule: data.sleep_schedule,
        hope_to_experience: data.hope_to_experience || null,
        floor_event_idea: data.floor_event_idea || null,
        requires_accessibility: data.requires_accessibility || false,
        raw_responses: data.answers,
      };
      const { error } = await supabase.from('student_profiles').insert(payload);
      if (error) throw error;
      setSubmitSuccess(true);
      reset();
      clearFormDraft();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to submit. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastQuestion = currentIndex === TOTAL - 1;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return;
      if (interstitial || !isAnswered || isSubmitting) return;
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      e.preventDefault();
      if (isLastQuestion) {
        handleSubmit(onSubmit)();
      } else {
        goNext();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [interstitial, isAnswered, isSubmitting, isLastQuestion, goNext, handleSubmit, onSubmit]);

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-cream-base flex flex-col items-center justify-center px-6"
      >
        <Image src="/sorting-hat.png" alt="Sorting Hat" width={320} height={320} className="mb-6" />
        <h2
          className="text-[1.75rem] italic text-ink-primary text-center mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          You&apos;re all set!
        </h2>
        <p className="text-sm text-ink-muted text-center mb-8">
          Your responses have been saved. You&apos;ll hear from us soon.
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-8 h-12 rounded-full bg-purple-primary text-white font-semibold text-base hover:bg-purple-800 transition-colors"
        >
          Home
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-base overflow-hidden">
      {!interstitial && (
        <QuizHeader currentIndex={currentIndex} totalQuestions={TOTAL} />
      )}

      <AnimatePresence>
        {interstitial && (
          <SectionInterstitial
            key={interstitial}
            trigger={interstitial}
            onComplete={onInterstitialComplete}
          />
        )}
      </AnimatePresence>

      {!interstitial && (
        <AnimatePresence mode="wait" custom={direction}>
          <QuizScreen
            key={currentIndex}
            question={currentQuestion}
            control={control}
            direction={direction}
          />
        </AnimatePresence>
      )}

      {!interstitial && (
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 backdrop-blur-sm bg-cream-base/80">
          {submitError && (
            <p className="text-sm text-red-500 text-center mb-3">{submitError}</p>
          )}
          <div className="flex gap-3">
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="px-6 h-14 rounded-full bg-purple-light text-ink-muted font-semibold text-base"
              >
                ← Back
              </button>
            )}
            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isAnswered}
                className={[
                  'flex-1 h-14 rounded-full font-semibold text-base transition-colors',
                  isSubmitting || !isAnswered
                    ? 'bg-purple-light text-ink-muted cursor-not-allowed'
                    : 'bg-purple-primary text-white',
                ].join(' ')}
              >
                {isSubmitting ? 'Submitting…' : 'Submit →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!isAnswered}
                className={[
                  'flex-1 h-14 rounded-full font-semibold text-base transition-colors',
                  !isAnswered
                    ? 'bg-purple-light text-ink-muted cursor-not-allowed'
                    : 'bg-purple-primary text-white',
                ].join(' ')}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
