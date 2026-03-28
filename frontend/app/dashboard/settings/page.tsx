'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  return (
    <aside className="w-[220px] sticky top-0 h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      <div className="flex items-center justify-center px-5 py-5 border-b border-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sortinglogo.png" alt="Sorting Hat"
          style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
          onClick={() => router.push('/dashboard')} />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <NavItem icon="◉" label="Dashboard" onClick={() => router.push('/dashboard')} />
        <NavItem icon="👥" label="Students"  onClick={() => router.push('/dashboard/students')} />
        <NavItem icon="⚙" label="Settings"  active />
      </nav>
      <div className="px-3 pb-6">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors text-sm">
          <span>⏏</span> Log out
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }: {
  icon: string; label: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={[
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
      active
        ? 'bg-purple-50 text-purple-700 font-medium'
        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer',
    ].join(' ')}>
      <span>{icon}</span><span>{label}</span>
    </div>
  );
}

// ─── Action Card ──────────────────────────────────────────────────────────────

type Status = { type: 'success' | 'error'; message: string } | null;

function ActionCard({
  title, description, buttonLabel, buttonVariant, loading, status, onAction,
}: {
  title:          string;
  description:    string;
  buttonLabel:    string;
  buttonVariant:  'danger' | 'primary';
  loading:        boolean;
  status:         Status;
  onAction:       () => void;
}) {
  const btnBase = 'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-60';
  const btnStyle = buttonVariant === 'danger'
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-purple-700 hover:bg-purple-800 text-white';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-ink-primary mb-1">{title}</h2>
      <p className="text-sm text-ink-muted mb-4">{description}</p>

      <button
        type="button"
        onClick={onAction}
        disabled={loading}
        className={`${btnBase} ${btnStyle}`}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? 'Running…' : buttonLabel}
      </button>

      {status && (
        <p className={[
          'mt-3 text-xs rounded-lg px-3 py-2',
          status.type === 'success'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700 font-mono break-all',
        ].join(' ')}>
          {status.message}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();

  const [clearLoading, setClearLoading] = useState(false);
  const [clearStatus,  setClearStatus]  = useState<Status>(null);

  const [seedLoading,  setSeedLoading]  = useState(false);
  const [seedStatus,   setSeedStatus]   = useState<Status>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('dashboard_auth')) {
      router.replace('/dashboard/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('dashboard_auth');
    router.push('/');
  };

  function authHeaders() {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dashboard_auth') ?? '' : '';
    return { 'Authorization': `Bearer ${stored}` };
  }

  async function handleClear() {
    setClearLoading(true);
    setClearStatus(null);
    try {
      const res  = await fetch('/api/admin/clear', { method: 'POST', headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Unknown error');
      setClearStatus({ type: 'success', message: 'All tables cleared.' });
    } catch (err) {
      setClearStatus({ type: 'error', message: err instanceof Error ? err.message : String(err) });
    } finally {
      setClearLoading(false);
    }
  }

  async function handleSeed() {
    setSeedLoading(true);
    setSeedStatus(null);
    try {
      const res  = await fetch('/api/admin/seed', { method: 'POST', headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Unknown error');
      setSeedStatus({ type: 'success', message: 'Database seeded with 500 students (250 allocated, 250 incoming).' });
    } catch (err) {
      setSeedStatus({ type: 'error', message: err instanceof Error ? err.message : String(err) });
    } finally {
      setSeedLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-cream-base">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl text-ink-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Settings
          </h1>
          <p className="text-sm text-ink-muted mt-1">Demo controls — for fixing the MVP during presentation.</p>
        </div>

        <div className="flex flex-col gap-4 max-w-lg">
          <ActionCard
            title="Clear All Data"
            description="Deletes every row from all three tables: student_profiles, allocation_runs, and student_allocations. Irreversible."
            buttonLabel="Clear All Data"
            buttonVariant="danger"
            loading={clearLoading}
            status={clearStatus}
            onAction={handleClear}
          />

          <ActionCard
            title="Seed Database"
            description="Inserts 500 synthetic student profiles and runs the allocation algorithm to create a locked previous-year allocation for 250 returners. Takes ~30 seconds."
            buttonLabel="Seed Database"
            buttonVariant="primary"
            loading={seedLoading}
            status={seedStatus}
            onAction={handleSeed}
          />
        </div>
      </main>
    </div>
  );
}
