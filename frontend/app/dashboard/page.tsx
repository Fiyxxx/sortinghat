'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RunData {
  id:             string;
  created_at:     string;
  global_fitness: number;
  duration_ms:    number;
  student_count:  number;
  floor_scores:   Record<string, number>;
}

interface AllocationRow {
  floor_number:       number;
  archetype:          string;
  floor_score:        number;
  nus_id:             string;
  room_type_assigned: string;
}

interface DashboardData {
  run:           RunData | null;
  allocations:   AllocationRow[];
  totalStudents: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ARCHETYPE_COLORS: Record<string, string> = {
  connector:  '#5B3E8F',
  explorer:   '#8B5CF6',
  anchor:     '#059669',
  harmoniser: '#D97706',
  thinker:    '#2563EB',
  adaptor:    '#6B7280',
};

const ARCHETYPE_ORDER = ['connector', 'explorer', 'anchor', 'harmoniser', 'thinker', 'adaptor'];

const FLOORS = Array.from({ length: 18 }, (_, i) => i + 4); // L4–L21

const RC_OPTIONS = [
  { value: 'tembusu',  label: 'Tembusu College',               locked: false },
  { value: 'cinnamon', label: 'Cinnamon College',              locked: true  },
  { value: 'capt',     label: 'College of Alice & Peter Tan',  locked: true  },
  { value: 'rc4',      label: 'Residential College 4',         locked: true  },
  { value: 'rvrc',     label: 'Ridge View Residential College', locked: true },
  { value: 'sheares',  label: 'Sheares Hall',                  locked: true  },
];

function scoreColor(score: number): string {
  if (score >= 0.70) return '#22c55e';
  if (score >= 0.50) return '#eab308';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score >= 0.70) return 'Good';
  if (score >= 0.50) return 'Fair';
  return 'Poor';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-SG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function WheelchairIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  // Standard ISA wheelchair symbol — person seated, arm forward, large rear wheel
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="9" cy="4" r="2" fill="currentColor" stroke="none" />
      {/* Chair back (spine + chair back, vertical) */}
      <line x1="9" y1="6" x2="9" y2="14" />
      {/* Seat (horizontal) */}
      <line x1="9" y1="14" x2="16" y2="14" />
      {/* Arm reaching forward */}
      <line x1="9" y1="9" x2="14" y2="7" />
      {/* Large rear wheel */}
      <circle cx="11" cy="19.5" r="3.5" />
      {/* Small front wheel */}
      <circle cx="16" cy="18" r="1.5" />
    </svg>
  );
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={16} height={16}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={14} height={14}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} width={14} height={14}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  return (
    <aside className="w-[220px] sticky top-0 h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Brand */}
      <div className="flex items-center justify-center px-5 py-5 border-b border-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sortinglogo.png"
          alt="Sorting Hat"
          style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
          onClick={() => router.push('/dashboard')}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <NavItem icon="◉" label="Dashboard" active onClick={() => router.push('/dashboard')} />
        <NavItem icon="👥" label="Students" onClick={() => router.push('/dashboard/students')} />
        <NavItem icon="⚙" label="Settings" onClick={() => router.push('/dashboard/settings')} />
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors text-sm"
        >
          <span>⏏</span> Log out
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  icon, label, active, onClick,
}: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={[
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
        active
          ? 'bg-purple-50 text-purple-700 font-medium'
          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer',
      ].join(' ')}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ─── RC Dropdown ─────────────────────────────────────────────────────────────

function RCDropdown({
  value, onChange,
}: {
  value:    string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = RC_OPTIONS.find(r => r.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="h-10 px-4 rounded-xl bg-white border border-gray-200 text-ink-primary text-sm font-medium shadow-sm flex items-center gap-2.5 min-w-[196px] hover:border-purple-primary/40 transition-colors"
      >
        <span className="flex-1 text-left">{selected?.label}</span>
        <ChevronIcon className={`text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
          {RC_OPTIONS.map(rc => (
            <button
              key={rc.value}
              onClick={() => {
                if (!rc.locked) { onChange(rc.value); setOpen(false); }
              }}
              className={[
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left',
                rc.locked
                  ? 'text-gray-300 cursor-not-allowed'
                  : rc.value === value
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {rc.locked ? (
                <LockIcon className="text-gray-300 shrink-0" />
              ) : rc.value === value ? (
                <CheckIcon className="text-purple-600 shrink-0" />
              ) : (
                <span className="w-[14px] shrink-0" />
              )}
              <span className={rc.locked ? 'opacity-40' : ''}>{rc.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub,
}: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
      <p className="text-xs text-ink-muted font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink-primary">{value}</p>
      {sub && <p className="text-xs text-ink-muted mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Floor Row ────────────────────────────────────────────────────────────────

function FloorRow({
  level, score, students, archetypeCounts, onFloorClick,
}: {
  level:           number;
  score:           number | null;
  students:        number;
  archetypeCounts: Record<string, number>;
  onFloorClick:    (level: number) => void;
}) {
  const isAmenity = level === 9 || level === 17;

  return (
    <div
      onClick={() => onFloorClick(level)}
      className="flex items-center gap-4 px-5 py-3 hover:bg-purple-light/30 transition-colors rounded-xl cursor-pointer"
    >
      {/* Level badge */}
      <div className="w-14 shrink-0 flex items-center gap-1.5">
        <span className="text-sm font-semibold text-ink-primary">L{level}</span>
        {isAmenity && (
          <WheelchairIcon size={12} className="text-ink-muted" />
        )}
      </div>

      {/* Score bar */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-2 bg-purple-light rounded-full overflow-hidden">
          {score !== null && (
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(score * 100).toFixed(0)}%`, backgroundColor: scoreColor(score) }}
            />
          )}
        </div>
        <span
          className="text-sm font-semibold w-10 text-right"
          style={{ color: score !== null ? scoreColor(score) : '#9CA3AF' }}
        >
          {score !== null ? score.toFixed(2) : '—'}
        </span>
        {score !== null && (
          <span className="text-xs w-8" style={{ color: scoreColor(score) }}>
            {scoreLabel(score)}
          </span>
        )}
      </div>

      {/* Student count */}
      <div className="w-14 text-right text-sm text-ink-muted">
        {students > 0 ? `${students} sts` : '—'}
      </div>

      {/* Archetype dots */}
      <div className="w-24 flex gap-0.5 justify-end flex-wrap">
        {ARCHETYPE_ORDER.map(arch => {
          const count = archetypeCounts[arch] ?? 0;
          if (count === 0) return null;
          return Array.from({ length: Math.min(count, 4) }).map((_, i) => (
            <div
              key={`${arch}-${i}`}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ARCHETYPE_COLORS[arch] }}
              title={arch}
            />
          ));
        })}
      </div>
    </div>
  );
}

// ─── Right Panel ─────────────────────────────────────────────────────────────

interface ProcessResult {
  processed: number;
  skipped:   number;
  errors:    number;
}

function RightPanel({
  data, isRunning, onRun, isProcessing, onProcess, processResult, responsesAvailable,
}: {
  data:               DashboardData;
  isRunning:          boolean;
  onRun:              () => void;
  isProcessing:       boolean;
  onProcess:          () => void;
  processResult:      ProcessResult | null;
  responsesAvailable: number | null;
}) {
  const archetypeTotals: Record<string, number> = {};
  for (const row of data.allocations) {
    archetypeTotals[row.archetype] = (archetypeTotals[row.archetype] ?? 0) + 1;
  }
  const totalAllocated = data.allocations.length;

  return (
    <aside className="w-[300px] shrink-0 flex flex-col gap-4">

      {/* ── Step 1: Process open-ended responses ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
          Step 1 — AI Processing
        </p>
        <button
          onClick={onProcess}
          disabled={isProcessing || isRunning}
          className={[
            'w-full h-10 rounded-xl font-medium text-sm transition-all border',
            isProcessing
              ? 'border-purple-light text-ink-muted cursor-not-allowed bg-white'
              : 'border-purple-primary/40 text-purple-700 hover:bg-purple-50 active:scale-[0.98] bg-white',
          ].join(' ')}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> Processing…
            </span>
          ) : 'Process Open-ended Responses'}
        </button>

        <div className="mt-3 space-y-1.5">
          {responsesAvailable !== null && (
            <p className="text-xs text-ink-muted">
              {responsesAvailable} student{responsesAvailable !== 1 ? 's' : ''} with text responses
            </p>
          )}
          {processResult && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Updated {processResult.processed} profiles
              {processResult.errors > 0 && ` (${processResult.errors} failed)`}
            </p>
          )}
        </div>
      </div>

      {/* ── Step 2: Run allocation ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
          Step 2 — Run Allocation
        </p>
        <button
          onClick={onRun}
          disabled={isRunning || isProcessing}
          className={[
            'w-full h-12 rounded-xl font-semibold text-base transition-all',
            isRunning
              ? 'bg-purple-light text-ink-muted cursor-not-allowed'
              : 'bg-purple-primary text-white hover:opacity-90 active:scale-[0.98]',
          ].join(' ')}
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> Running…
            </span>
          ) : data.run ? 'Re-run Allocation' : 'Run Allocation'}
        </button>

        {data.run && !isRunning && (
          <div className="mt-4 space-y-2 text-sm">
            <InfoRow label="Last run"       value={formatTime(data.run.created_at)} />
            <InfoRow label="Global fitness" value={data.run.global_fitness.toFixed(3)} />
            <InfoRow label="Placed"         value={String(data.run.student_count)} />
            <InfoRow label="Duration"       value={formatDuration(data.run.duration_ms)} />
          </div>
        )}
      </div>

      {totalAllocated > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-4">
            Archetype Distribution
          </p>
          <div className="space-y-2.5">
            {ARCHETYPE_ORDER.map(arch => {
              const count = archetypeTotals[arch] ?? 0;
              const pct   = totalAllocated > 0 ? (count / totalAllocated) * 100 : 0;
              return (
                <div key={arch} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ARCHETYPE_COLORS[arch] }} />
                  <span className="text-xs text-ink-primary capitalize w-20">{arch}</span>
                  <div className="flex-1 h-1.5 bg-purple-light rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct.toFixed(0)}%`, backgroundColor: ARCHETYPE_COLORS[arch] }} />
                  </div>
                  <span className="text-xs text-ink-muted w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-ink-muted">{label}</span>
      <span className="text-ink-primary font-medium text-right">{value}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-ink-muted" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData]               = useState<DashboardData>({ run: null, allocations: [], totalStudents: null });
  const [isLoading, setIsLoading]     = useState(true);
  const [isRunning, setIsRunning]     = useState(false);
  const [isResetting, setIsResetting]     = useState(false);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [responsesAvailable, setResponsesAvailable] = useState<number | null>(null);
  const [runError, setRunError]           = useState<string | null>(null);
  const [fetchError, setFetchError]       = useState<string | null>(null);
  const [selectedRC, setSelectedRC]       = useState('tembusu');

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('dashboard_auth')) {
      router.replace('/dashboard/login');
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    setFetchError(null);
    try {
      const res  = await fetch('/api/allocate');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to fetch');
      setData(json);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch count of students with open-ended responses on mount
  useEffect(() => {
    fetch('/api/process-responses')
      .then(r => r.json())
      .then(j => { if (typeof j.withResponses === 'number') setResponsesAvailable(j.withResponses); })
      .catch(() => {});
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    setRunError(null);
    try {
      const res  = await fetch('/api/allocate', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Allocation failed');
      await fetchData();
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setRunError(null);
    try {
      const res  = await fetch('/api/process-responses', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Processing failed');
      setProcessResult(json);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setRunError(null);
    try {
      const res  = await fetch('/api/allocate', { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Reset failed');
      await fetchData();
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboard_auth');
    router.push('/');
  };

  const floorStudents: Record<number, AllocationRow[]> = {};
  for (const row of data.allocations) {
    if (!floorStudents[row.floor_number]) floorStudents[row.floor_number] = [];
    floorStudents[row.floor_number].push(row);
  }

  const minScore = data.run ? Math.min(...Object.values(data.run.floor_scores)) : null;
  const maxScore = data.run ? Math.max(...Object.values(data.run.floor_scores)) : null;
  const worstFloor = data.run
    ? Number(Object.entries(data.run.floor_scores).sort(([, a], [, b]) => a - b)[0]?.[0] ?? 0)
    : null;

  return (
    <div className="flex min-h-screen bg-cream-base">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        {/* Page title + controls */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-ink-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Floor Allocation
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={isResetting || !data.run}
              className="h-10 px-4 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 disabled:opacity-40 transition-colors"
            >
              {isResetting ? 'Resetting…' : 'Reset Incoming'}
            </button>

            <RCDropdown value={selectedRC} onChange={setSelectedRC} />
          </div>
        </div>

        {(runError || fetchError) && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-mono break-all">
            {runError ?? fetchError}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Students" value={isLoading ? '—' : (data.totalStudents ?? '—')} sub="in database" />
          <StatCard
            label="Allocated"
            value={
              data.run
                ? `${data.run.student_count} / ${data.totalStudents ?? '?'}`
                : '—'
            }
            sub={data.run ? 'placed / total' : 'no run yet'}
          />
          <StatCard label="Global Fitness" value={data.run ? data.run.global_fitness.toFixed(3) : '—'} sub={worstFloor ? `worst: L${worstFloor}` : 'min floor score'} />
          <StatCard
            label="Score Range"
            value={minScore !== null && maxScore !== null ? `${minScore.toFixed(2)}–${maxScore.toFixed(2)}` : '—'}
            sub="min–max across floors"
          />
        </div>

        {/* Floor list + right panel */}
        <div className="flex gap-6">
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-3 border-b border-purple-light/60">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide w-14">Floor</span>
              <span className="flex-1 text-xs font-semibold text-ink-muted uppercase tracking-wide">Diversity Score</span>
              <span className="w-14 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Students</span>
              <span className="w-24 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Archetypes</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-48 text-ink-muted text-sm gap-2">
                <Spinner /> Loading…
              </div>
            ) : (
              <div className="divide-y divide-purple-light/30">
                {FLOORS.map(level => {
                  const students = floorStudents[level] ?? [];
                  const score    = data.run ? (data.run.floor_scores[String(level)] ?? null) : null;
                  const archetypeCounts: Record<string, number> = {};
                  for (const s of students) {
                    archetypeCounts[s.archetype] = (archetypeCounts[s.archetype] ?? 0) + 1;
                  }
                  return (
                    <FloorRow
                      key={level}
                      level={level}
                      score={score}
                      students={students.length}
                      archetypeCounts={archetypeCounts}
                      onFloorClick={l => router.push(`/dashboard/students?floor=${l}`)}
                    />
                  );
                })}
              </div>
            )}

            <div className="px-5 py-3 border-t border-purple-light/60 flex items-center gap-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                <WheelchairIcon size={11} className="text-ink-muted" />
                amenity floor (L9, L17)
              </span>
              <div className="flex items-center gap-4">
                {[['#22c55e', '≥ 0.70 Good'], ['#eab308', '0.50–0.69 Fair'], ['#ef4444', '< 0.50 Poor']].map(([color, label]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-ink-muted">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <RightPanel
            data={data}
            isRunning={isRunning}
            onRun={handleRun}
            isProcessing={isProcessing}
            onProcess={handleProcess}
            processResult={processResult}
            responsesAvailable={responsesAvailable}
          />
        </div>
      </main>
    </div>
  );
}
