'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface Props {
  onAuth: (nusId: string) => void;
}

const NUS_ID_REGEX = /^[Aa]\d{7}[A-Za-z]$/;

export default function AuthScreen({ onAuth }: Props) {
  const [nusId, setNusId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedId = nusId.trim().toUpperCase();
    if (!NUS_ID_REGEX.test(trimmedId)) {
      setError('Please enter a valid NUS ID (e.g. A0123456X)');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsChecking(true);
    try {
      const { data, error: dbError } = await supabase
        .from('student_profiles')
        .select('nus_id')
        .eq('nus_id', trimmedId)
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        setError('This NUS ID has already submitted a response. Each student can only submit once.');
        return;
      }
    } catch {
      // If check fails, allow through — don't block on a DB error
    } finally {
      setIsChecking(false);
    }

    onAuth(trimmedId);
  };

  return (
    <div className="min-h-screen bg-cream-base flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/sortinglogo.png"
            alt="Sorting Hat"
            width={200}
            height={64}
            className="select-none object-contain"
            style={{ height: '64px', width: 'auto' }}
          />
        </div>

        <h1 className="text-2xl font-bold text-ink-primary text-center mb-2">
          Welcome
        </h1>
        <p className="text-sm text-ink-muted text-center mb-8">
          Sign in with your NUS credentials to begin the quiz
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-primary mb-1.5">
              NUS ID
            </label>
            <input
              type="text"
              value={nusId}
              onChange={(e) => setNusId(e.target.value)}
              placeholder="e.g. A0123456X"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-4 py-3 rounded-xl bg-white border border-purple-light text-ink-primary text-base placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-purple-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-primary mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-white border border-purple-light text-ink-primary text-base placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-purple-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isChecking}
            className="w-full h-14 rounded-full bg-purple-primary text-white font-semibold text-base mt-2 disabled:opacity-60"
          >
            {isChecking ? 'Checking…' : 'Continue →'}
          </button>
        </form>
      </div>
    </div>
  );
}
