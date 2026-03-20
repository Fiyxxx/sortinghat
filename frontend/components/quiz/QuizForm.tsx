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
      console.log('Draft found:', draft);
      // reset(draft); // Uncomment to auto-restore
    }
  }, []);

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
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-gray-600 mb-6">Your responses have been saved.</p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <QuizHeader
        currentSection={currentSection}
        totalSections={sections.length}
        currentSectionIndex={currentSectionIndex}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          {/* Personality Section */}
          <div className={currentSection === 'personality' ? 'block' : 'hidden'}>
            <PersonalitySection control={control} />
          </div>

          {/* Preferences Section */}
          <div className={currentSection === 'preferences' ? 'block' : 'hidden'}>
            <PreferencesSection control={control} />
          </div>

          {/* Accessibility Section */}
          <div className={currentSection === 'accessibility' ? 'block' : 'hidden'}>
            <AccessibilitySection control={control} />
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-8">
            {currentSectionIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentSection(sections[currentSectionIndex - 1])}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
              >
                ← Previous
              </button>
            )}

            {currentSectionIndex < sections.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentSection(sections[currentSectionIndex + 1])}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit My Responses →'}
              </button>
            )}
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{submitError}</p>
            </div>
          )}

          {/* Validation Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 font-medium">Please complete all required fields</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
