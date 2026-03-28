'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { DEMO_ROSTER } from '@/lib/demo-roster';

// ─── House mapping ────────────────────────────────────────────────────────────

interface House {
  name:   string;
  image:  string;
  ext:    string;
  border: string;
}

function getHouse(floor: number): House {
  if (floor <= 7)  return { name: 'Shan',   image: 'shan',   ext: 'png', border: '#6B7280' };
  if (floor <= 11) return { name: 'Ora',    image: 'ora',    ext: 'png', border: '#14532D' };
  if (floor <= 14) return { name: 'Gaja',   image: 'gaja',   ext: 'jpg', border: '#1E3A5F' };
  if (floor <= 18) return { name: 'Tancho', image: 'tancho', ext: 'jpg', border: '#7F1D1D' };
  return             { name: 'Ponya',  image: 'ponya',  ext: 'jpg', border: '#78350F' };
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function useConfetti() {
  useEffect(() => {
    const canvas  = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;

    const COLORS = ['#7C3AED', '#A78BFA', '#C4B5FD', '#F59E0B', '#FDE68A', '#6D28D9', '#FBBF24'];
    const particles = Array.from({ length: 130 }, () => ({
      x:        Math.random() * canvas.width,
      y:        -10 - Math.random() * 120,
      w:        5 + Math.random() * 7,
      h:        7 + Math.random() * 5,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      vx:       (Math.random() - 0.5) * 2.5,
      vy:       1.5 + Math.random() * 3.5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
    }));

    const DURATION = 4500;
    let animId: number;
    let start: number | null = null;

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x        += p.vx;
        p.y        += p.vy;
        p.vy       += 0.04;
        p.rotation += p.rotSpeed;
        const alpha = elapsed > DURATION * 0.65
          ? 1 - (elapsed - DURATION * 0.65) / (DURATION * 0.35)
          : 1;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (elapsed < DURATION) {
        animId = requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }

    animId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animId); canvas.remove(); };
  }, []);
}

// ─── Auth screen ──────────────────────────────────────────────────────────────

const NUS_ID_REGEX = /^[Aa]\d{7}[A-Za-z]$/;

function AuthScreen({ onAuth }: { onAuth: (nusId: string) => void }) {
  const [nusId,    setNusId]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nusId.trim().toUpperCase();
    if (!NUS_ID_REGEX.test(trimmed)) {
      setError('Please enter a valid NUS ID (e.g. A0123456X)');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    onAuth(trimmed);
  }

  return (
    <div className="min-h-screen bg-cream-base flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/sortinglogo.png" alt="Sorting Hat" width={200} height={64}
            className="select-none object-contain" style={{ height: '64px', width: 'auto' }} />
        </div>

        <h1 className="text-2xl font-bold text-ink-primary text-center mb-2">
          View My Room
        </h1>
        <p className="text-sm text-ink-muted text-center mb-8">
          Sign in to see your floor assignment
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-primary mb-1.5">NUS ID</label>
            <input type="text" value={nusId} onChange={e => setNusId(e.target.value)}
              placeholder="e.g. A0123456X" autoCapitalize="characters" autoCorrect="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl bg-white border border-purple-light text-ink-primary text-base placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-purple-primary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-primary mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-white border border-purple-light text-ink-primary text-base placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-purple-primary" />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button type="submit"
            className="w-full h-14 rounded-full bg-purple-primary text-white font-semibold text-base mt-2">
            View My Room →
          </button>
        </form>

        <button onClick={() => window.history.back()}
          className="w-full mt-4 text-sm text-ink-muted hover:text-ink-primary transition-colors text-center">
          ← Back
        </button>
      </div>
    </div>
  );
}

// ─── Result display ───────────────────────────────────────────────────────────

interface AllocationData {
  nus_id:       string;
  floor_number: number;
  unit_number:  string;
}

function ResultDisplay({ data, nusId }: { data: AllocationData; nusId: string }) {
  useConfetti();
  const router  = useRouter();
  const house   = getHouse(data.floor_number);
  const demo    = DEMO_ROSTER[nusId];
  const imgSrc  = `/houses/${house.image}.${house.ext}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-cream-base flex flex-col items-center justify-center px-6 py-10"
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center">

        {/* House image */}
        <div className="w-52 h-52 rounded-2xl overflow-hidden border-4 mb-6" style={{ borderColor: house.border }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt={house.name} className="w-full h-full object-cover" />
        </div>

        {/* Welcome */}
        <p className="text-base font-medium text-purple-primary tracking-widest uppercase mb-2">
          Welcome to Tembusu
        </p>
        {demo && (
          <h1
            className="text-5xl text-ink-primary mb-1"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            {demo.name}
          </h1>
        )}

        {/* House name */}
        <div className="mt-4 mb-1">
          <span className="text-2xl font-bold text-ink-primary tracking-wide">
            House {house.name}
          </span>
        </div>

        {/* Unit number */}
        <p className="text-ink-muted text-base mt-5 mb-1 uppercase tracking-wide font-medium">Your Room</p>
        <p
          className="text-7xl font-bold text-ink-primary leading-none mb-8"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {data.floor_number}-{data.unit_number}
        </p>

        {/* Check-in button */}
        <button
          type="button"
          className="w-full h-16 rounded-full bg-purple-primary text-white font-semibold text-xl tracking-wide shadow-sm hover:bg-purple-800 transition-colors"
        >
          Check-in
        </button>

        {/* Back */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 text-sm text-ink-muted hover:text-ink-primary transition-colors"
        >
          ← Back to home
        </button>
      </div>
    </motion.div>
  );
}

// ─── Not found ────────────────────────────────────────────────────────────────

function NotFound({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-cream-base flex flex-col items-center justify-center px-6 text-center">
      <p className="text-4xl mb-4">🎩</p>
      <h2 className="text-xl font-semibold text-ink-primary mb-2">Not allocated yet</h2>
      <p className="text-sm text-ink-muted mb-6">
        Your room hasn&apos;t been assigned yet. Check back after allocation runs.
      </p>
      <button onClick={onBack} className="text-sm text-purple-primary hover:underline">← Try again</button>
      <button onClick={() => router.push('/')} className="mt-3 text-sm text-ink-muted hover:text-ink-primary">Back to home</button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Stage = 'auth' | 'loading' | 'found' | 'not_found';

export default function ResultPage() {
  const [stage,   setStage]   = useState<Stage>('auth');
  const [nusId,   setNusId]   = useState('');
  const [data,    setData]    = useState<AllocationData | null>(null);

  async function handleAuth(id: string) {
    setNusId(id);
    setStage('loading');
    try {
      const res  = await fetch(`/api/result?nusId=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
        setStage('found');
      } else {
        setStage('not_found');
      }
    } catch {
      setStage('not_found');
    }
  }

  if (stage === 'auth')      return <AuthScreen onAuth={handleAuth} />;
  if (stage === 'not_found') return <NotFound onBack={() => setStage('auth')} />;
  if (stage === 'found' && data) return <ResultDisplay data={data} nusId={nusId} />;

  // loading
  return (
    <div className="min-h-screen bg-cream-base flex items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-purple-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}
