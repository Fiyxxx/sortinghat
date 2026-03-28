'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLoginPage() {
  const [passcode,   setPasscode]   = useState('');
  const [error,      setError]      = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError('');
    try {
      const res = await fetch('/api/auth/dashboard', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ passcode }),
      });
      if (res.ok) {
        // Store the actual passcode so settings page can use it as an auth token
        localStorage.setItem('dashboard_auth', passcode);
        router.push('/dashboard');
      } else {
        setError('Incorrect passcode. Try again.');
        setPasscode('');
      }
    } catch {
      setError('Could not reach server. Try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sortinglogo.png" alt="Sorting Hat" style={{ height: '52px', width: 'auto' }} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1
            className="text-ink-primary text-2xl mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            HR Dashboard
          </h1>
          <p className="text-ink-muted text-sm mb-6">Enter the committee passcode to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={e => { setPasscode(e.target.value); setError(''); }}
              placeholder="Passcode"
              autoFocus
              className="w-full bg-white border border-purple-light rounded-xl px-4 py-3 text-ink-primary placeholder:text-ink-muted text-base outline-none focus:ring-2 focus:ring-purple-primary transition-colors"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!passcode || isChecking}
              className="w-full h-12 rounded-xl bg-purple-primary text-white font-semibold text-base disabled:opacity-40 transition-opacity"
            >
              {isChecking ? 'Checking…' : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
