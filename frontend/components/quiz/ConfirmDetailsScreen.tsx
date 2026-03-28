'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DEMO_ROSTER, FACULTIES, RACES } from '@/lib/demo-roster';

interface Props {
  nusId:      string;
  onConfirm:  (faculty: string, race: string) => void;
}

export default function ConfirmDetailsScreen({ nusId, onConfirm }: Props) {
  const demo = DEMO_ROSTER[nusId];

  const [faculty, setFaculty] = useState(demo?.faculty ?? '');
  const [race,    setRace]    = useState(demo?.race    ?? '');

  const canContinue = faculty !== '' && race !== '';

  const selectClass = [
    'w-full px-4 py-3 rounded-xl bg-white border border-purple-light text-ink-primary text-base',
    'focus:outline-none focus:ring-2 focus:ring-purple-primary appearance-none',
  ].join(' ');

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

        <h1 className="text-4xl font-bold text-ink-primary text-center mb-1">
          {demo ? `Hi ${demo.name},` : 'Please confirm your details'}
        </h1>
        {demo && (
          <p className="text-[1.3125rem] text-ink-muted text-center mb-6">
            Please confirm your details before starting the quiz.
          </p>
        )}
        {!demo && (
          <p className="text-[1.3125rem] text-ink-muted text-center mb-6">
            Tell us a bit about yourself before we begin.
          </p>
        )}

        <div className="space-y-4">
          {/* NUS ID — read-only */}
          <div>
            <label className="block text-sm font-semibold text-ink-primary mb-1.5">
              NUS ID
            </label>
            <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-purple-light text-ink-muted text-base font-mono select-none">
              {nusId}
            </div>
          </div>

          {/* Faculty */}
          <div>
            <label className="block text-sm font-semibold text-ink-primary mb-1.5">
              Faculty
            </label>
            <div className="relative">
              <select
                value={faculty}
                onChange={e => setFaculty(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>Select faculty…</option>
                {FACULTIES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
                ▾
              </div>
            </div>
          </div>

          {/* Race */}
          <div>
            <label className="block text-sm font-semibold text-ink-primary mb-1.5">
              Race / Ethnicity
            </label>
            <div className="relative">
              <select
                value={race}
                onChange={e => setRace(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>Select race…</option>
                {RACES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
                ▾
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(faculty, race)}
          disabled={!canContinue}
          className={[
            'w-full h-14 rounded-full font-semibold text-base mt-6 transition-colors',
            canContinue
              ? 'bg-purple-primary text-white'
              : 'bg-purple-light text-ink-muted cursor-not-allowed',
          ].join(' ')}
        >
          Confirm & Start Quiz →
        </button>
      </div>
    </div>
  );
}
