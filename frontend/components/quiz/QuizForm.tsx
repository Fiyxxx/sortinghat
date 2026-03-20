'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { QuizFormData, StudentProfile } from '@/lib/types';
import { quizFormSchema } from '@/lib/validation';
import { computePersonalityScores } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';
import { saveFormDraft, loadFormDraft, clearFormDraft } from '@/lib/form-storage';
import QuizHeader from './QuizHeader';
import PersonalitySection from './PersonalitySection';
import PreferencesSection from './PreferencesSection';
import AccessibilitySection from './AccessibilitySection';
import { Button, Card } from '@/components/ui';

export default function QuizForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentSection, setCurrentSection] = useState<'personality' | 'preferences' | 'accessibility'>('personality');

  const sections = ['personality', 'preferences', 'accessibility'] as const;
  const currentSectionIndex = sections.indexOf(currentSection);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      answers: {},
      room_type_preference: '',
      gender_floor_preference: '',
      sleep_schedule: 0.5,
      noise_tolerance: 0.5,
      aircon_usage: '',
      hope_to_experience: '',
      floor_event_idea: '',
      requires_accessibility: false
    }
  });

  // Watch form changes and save to localStorage
  useEffect(() => {
    const subscription = watch((data) => {
      saveFormDraft(data);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Load draft on mount
  useEffect(() => {
    const draft = loadFormDraft();
    if (draft) {
      // Optionally show a toast asking if they want to restore
      // reset(draft); // Uncomment to auto-restore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // reset intentionally omitted - only runs on mount

  const onSubmit = async (data: QuizFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Compute personality scores from answers
      const scores = computePersonalityScores(data.answers);

      // 2. Extract values from form data
      const payload: StudentProfile = {
        extraversion: scores.extraversion,
        openness: scores.openness,
        agreeableness: scores.agreeableness,
        conscientiousness: scores.conscientiousness,
        social_catalyst_score: scores.social_catalyst_score,
        room_type_preference: data.room_type_preference,
        gender_floor_preference: data.gender_floor_preference,
        sleep_schedule: data.sleep_schedule,
        noise_tolerance: data.noise_tolerance,
        aircon_usage: data.aircon_usage,
        hope_to_experience: data.hope_to_experience || null,
        floor_event_idea: data.floor_event_idea || null,
        requires_accessibility: data.requires_accessibility || false,
        raw_responses: data.answers
      };

      // 3. Insert into Supabase
      const { error } = await supabase
        .from('student_profiles')
        .insert(payload);

      if (error) throw error;

      // 4. Show success
      setSubmitSuccess(true);
      reset();
      clearFormDraft();

    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmitError(error.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <Card surface="lowest" padding="lg" rounded="2xl" shadow className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-tertiary-fixed rounded-full flex items-center justify-center mx-auto mb-spacing-6">
            <svg className="w-8 h-8 text-on-tertiary-fixed" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-headline-lg font-headline text-on-surface mb-spacing-2">Thank you!</h2>
          <p className="text-body-lg text-on-surface/70 mb-spacing-8">Your responses have been saved.</p>
          <Button variant="primary" onClick={() => setSubmitSuccess(false)} fullWidth>
            Submit Another Response
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <QuizHeader
        currentSection={currentSection}
        totalSections={sections.length}
        currentSectionIndex={currentSectionIndex}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-spacing-8 sm:py-spacing-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-spacing-12" aria-busy={isSubmitting}>
          {/* Personality Section */}
          <div className={currentSection === 'personality' ? 'block' : 'hidden'} aria-hidden={currentSection !== 'personality'}>
            <PersonalitySection control={control} />
          </div>

          {/* Preferences Section */}
          <div className={currentSection === 'preferences' ? 'block' : 'hidden'} aria-hidden={currentSection !== 'preferences'}>
            <PreferencesSection control={control} />
          </div>

          {/* Accessibility Section */}
          <div className={currentSection === 'accessibility' ? 'block' : 'hidden'} aria-hidden={currentSection !== 'accessibility'}>
            <AccessibilitySection control={control} />
          </div>

          {/* Navigation */}
          <div className="flex gap-spacing-4 pt-spacing-8">
            {currentSectionIndex > 0 && (
              <Button
                type="button"
                variant="tertiary"
                onClick={() => setCurrentSection(sections[currentSectionIndex - 1])}
              >
                ← Previous
              </Button>
            )}

            {currentSectionIndex < sections.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={() => setCurrentSection(sections[currentSectionIndex + 1])}
              >
                Next →
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit My Responses →'}
              </Button>
            )}
          </div>

          {/* Error Message */}
          {submitError && (
            <Card surface="highest" padding="lg" rounded="lg" role="alert">
              <p className="text-body-md text-on-surface font-medium">{submitError}</p>
            </Card>
          )}

          {/* Validation Errors */}
          {Object.keys(errors).length > 0 && (
            <Card surface="low" padding="md" rounded="lg" role="alert">
              <p className="text-body-md text-on-surface font-medium">Please complete all required fields</p>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
