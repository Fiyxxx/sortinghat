'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AllocStudent {
  nus_id:              string;
  floor_number:        number;
  unit_number:         string;
  room_type_assigned:  string;
  archetype:           string;
  floor_score:         number;
  is_locked:           boolean;
  placement_rationale: string;
  faculty:             string | null;
  race:                string | null;
}

interface UnallocStudent {
  nus_id:                 string;
  faculty:                string | null;
  race:                   string | null;
  sleep_schedule:         number | null;
  requires_accessibility: boolean;
  submitted_at:           string;
}

type SortDir = 'asc' | 'desc';

// ─── Constants ────────────────────────────────────────────────────────────────

const ARCHETYPE_COLORS: Record<string, string> = {
  connector:  '#5B3E8F',
  explorer:   '#8B5CF6',
  anchor:     '#059669',
  harmoniser: '#D97706',
  thinker:    '#2563EB',
  adaptor:    '#6B7280',
};

const FLOORS = Array.from({ length: 18 }, (_, i) => i + 4); // L4–L21

function scoreColor(score: number): string {
  if (score >= 0.70) return '#22c55e';
  if (score >= 0.50) return '#eab308';
  return '#ef4444';
}

function sleepLabel(v: number): string {
  if (v < 0.25) return 'Early bird';
  if (v < 0.50) return 'Evening';
  if (v < 0.75) return 'Night owl';
  return 'Very late';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function WheelchairIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="9" cy="4" r="2" fill="currentColor" stroke="none" />
      <line x1="9" y1="6" x2="9" y2="14" />
      <line x1="9" y1="14" x2="16" y2="14" />
      <line x1="9" y1="9" x2="14" y2="7" />
      <circle cx="11" cy="19.5" r="3.5" />
      <circle cx="16" cy="18" r="1.5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: SortDir }) {
  if (field !== sortField) {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-30">
        <path d="M5 1 L8 4 L2 4 Z" /><path d="M5 9 L8 6 L2 6 Z" />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-purple-primary">
      {sortDir === 'asc' ? <path d="M5 1 L8 5 L2 5 Z" /> : <path d="M5 9 L8 5 L2 5 Z" />}
    </svg>
  );
}

// ─── View Toggle ─────────────────────────────────────────────────────────────

function ViewToggle({
  view, allocCount, unallocCount, onChange,
}: {
  view:         'allocated' | 'unallocated';
  allocCount:   number | null;
  unallocCount: number | null;
  onChange:     (v: 'allocated' | 'unallocated') => void;
}) {
  return (
    <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-0.5 mb-5">
      {(['allocated', 'unallocated'] as const).map(v => {
        const isActive = view === v;
        const count    = v === 'allocated' ? allocCount : unallocCount;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-white shadow-sm text-ink-primary'
                : 'text-ink-muted hover:text-ink-primary',
            ].join(' ')}
          >
            {v === 'allocated' ? 'Allocated' : 'Not Allocated'}
            {count !== null && (
              <span className={[
                'text-xs px-1.5 py-0.5 rounded-full font-medium',
                isActive ? 'bg-purple-50 text-purple-700' : 'bg-gray-200 text-ink-muted',
              ].join(' ')}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Custom Floor Dropdown ────────────────────────────────────────────────────

function FloorDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  const options = [
    { label: 'All Floors', value: 'all' },
    ...FLOORS.map(l => ({
      label: `Level ${l}${l === 9 || l === 17 ? ' — accessible' : ''}`,
      value: String(l),
    })),
  ];
  const selected = options.find(o => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="h-9 px-3 pr-2.5 flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-ink-primary text-sm font-medium shadow-sm min-w-[140px]">
        <span className="flex-1 text-left truncate">{selected.label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 max-h-72 overflow-y-auto">
          {options.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={[
                'w-full text-left px-3 py-2 text-sm transition-colors',
                opt.value === value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-ink-primary hover:bg-gray-50',
              ].join(' ')}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <NavItem icon="◉" label="Dashboard"  onClick={() => router.push('/dashboard')} />
        <NavItem icon="👥" label="Students" active onClick={() => router.push('/dashboard/students')} />
        <NavItem icon="⚙" label="Settings" onClick={() => router.push('/dashboard/settings')} />
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
      active ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer',
    ].join(' ')}>
      <span>{icon}</span><span>{label}</span>
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

// ─── Students Content ─────────────────────────────────────────────────────────

function StudentsContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const floorParam   = searchParams.get('floor');
  const selectedFloor = floorParam ?? 'all';

  const [view, setView]               = useState<'allocated' | 'unallocated'>('allocated');

  // Allocated state
  const [allocStudents, setAllocStudents]   = useState<AllocStudent[]>([]);
  const [allocLoading, setAllocLoading]     = useState(true);
  const [allocSortField, setAllocSortField] = useState('floor_number');
  const [allocSortDir, setAllocSortDir]     = useState<SortDir>('asc');
  const [expanded, setExpanded]             = useState<string | null>(null);

  // Unallocated state
  const [unallocStudents, setUnallocStudents]   = useState<UnallocStudent[]>([]);
  const [unallocLoading, setUnallocLoading]     = useState(true);
  const [unallocSortField, setUnallocSortField] = useState('submitted_at');
  const [unallocSortDir, setUnallocSortDir]     = useState<SortDir>('desc');

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('dashboard_auth')) {
      router.replace('/dashboard/login');
    }
  }, [router]);

  const fetchAllocated = useCallback(async () => {
    setAllocLoading(true);
    setFetchError(null);
    try {
      const url  = selectedFloor === 'all' ? '/api/students' : `/api/students?floor=${selectedFloor}`;
      const res  = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to fetch');
      setAllocStudents(json.students ?? []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    } finally {
      setAllocLoading(false);
    }
  }, [selectedFloor]);

  const fetchUnallocated = useCallback(async () => {
    setUnallocLoading(true);
    try {
      const res  = await fetch('/api/students?status=unallocated');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to fetch');
      setUnallocStudents(json.students ?? []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    } finally {
      setUnallocLoading(false);
    }
  }, []);

  // Fetch allocated whenever floor filter changes
  useEffect(() => { fetchAllocated(); }, [fetchAllocated]);
  // Fetch unallocated once on mount
  useEffect(() => { fetchUnallocated(); }, [fetchUnallocated]);

  const handleFloorChange = (floor: string) => {
    setSearch('');
    router.push(floor === 'all' ? '/dashboard/students' : `/dashboard/students?floor=${floor}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboard_auth');
    router.push('/');
  };

  const handleViewChange = (v: 'allocated' | 'unallocated') => {
    setView(v);
    setSearch('');
    setExpanded(null);
  };

  // ── Allocated table helpers ─────────────────────────────────────────────────

  const handleAllocSort = (field: string) => {
    if (field === allocSortField) setAllocSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setAllocSortField(field); setAllocSortDir('asc'); }
  };

  const filteredAlloc = allocStudents.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.nus_id.toLowerCase().includes(q) ||
      (s.faculty ?? '').toLowerCase().includes(q) ||
      s.archetype.toLowerCase().includes(q);
  });

  const sortedAlloc = [...filteredAlloc].sort((a, b) => {
    let cmp = 0;
    switch (allocSortField) {
      case 'nus_id':             cmp = a.nus_id.localeCompare(b.nus_id); break;
      case 'faculty':            cmp = (a.faculty ?? '').localeCompare(b.faculty ?? ''); break;
      case 'floor_number':       cmp = a.floor_number - b.floor_number; break;
      case 'unit_number':        cmp = a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true }); break;
      case 'room_type_assigned': cmp = a.room_type_assigned.localeCompare(b.room_type_assigned); break;
      case 'archetype':          cmp = a.archetype.localeCompare(b.archetype); break;
      case 'floor_score':        cmp = a.floor_score - b.floor_score; break;
      case 'is_locked':          cmp = Number(a.is_locked) - Number(b.is_locked); break;
    }
    return allocSortDir === 'asc' ? cmp : -cmp;
  });

  // ── Unallocated table helpers ───────────────────────────────────────────────

  const handleUnallocSort = (field: string) => {
    if (field === unallocSortField) setUnallocSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setUnallocSortField(field); setUnallocSortDir('asc'); }
  };

  const filteredUnalloc = unallocStudents.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.nus_id.toLowerCase().includes(q) ||
      (s.faculty ?? '').toLowerCase().includes(q) ||
      (s.race ?? '').toLowerCase().includes(q);
  });

  const sortedUnalloc = [...filteredUnalloc].sort((a, b) => {
    let cmp = 0;
    switch (unallocSortField) {
      case 'nus_id':                 cmp = a.nus_id.localeCompare(b.nus_id); break;
      case 'faculty':                cmp = (a.faculty ?? '').localeCompare(b.faculty ?? ''); break;
      case 'race':                   cmp = (a.race ?? '').localeCompare(b.race ?? ''); break;
      case 'sleep_schedule':         cmp = (a.sleep_schedule ?? 0) - (b.sleep_schedule ?? 0); break;
      case 'submitted_at':           cmp = a.submitted_at.localeCompare(b.submitted_at); break;
      case 'requires_accessibility': cmp = Number(a.requires_accessibility) - Number(b.requires_accessibility); break;
    }
    return unallocSortDir === 'asc' ? cmp : -cmp;
  });

  // ── Render helpers ──────────────────────────────────────────────────────────

  function AllocHeader({ field, label, align = 'left' }: {
    field: string; label: string; align?: 'left' | 'center' | 'right';
  }) {
    const icon = <SortIcon field={field} sortField={allocSortField} sortDir={allocSortDir} />;
    return (
      <button type="button" onClick={() => handleAllocSort(field)} className={[
        'w-full flex items-center gap-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wide hover:text-ink-primary transition-colors',
        align === 'center' ? 'justify-center' : '',
        align === 'right'  ? 'justify-end'    : '',
      ].join(' ')}>
        {align === 'right' ? icon : null}
        {label}
        {align !== 'right' ? icon : null}
      </button>
    );
  }

  function UnallocHeader({ field, label, align = 'left' }: {
    field: string; label: string; align?: 'left' | 'center' | 'right';
  }) {
    const icon = <SortIcon field={field} sortField={unallocSortField} sortDir={unallocSortDir} />;
    return (
      <button type="button" onClick={() => handleUnallocSort(field)} className={[
        'w-full flex items-center gap-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wide hover:text-ink-primary transition-colors',
        align === 'center' ? 'justify-center' : '',
        align === 'right'  ? 'justify-end'    : '',
      ].join(' ')}>
        {align === 'right' ? icon : null}
        {label}
        {align !== 'right' ? icon : null}
      </button>
    );
  }

  const isLoading   = view === 'allocated' ? allocLoading   : unallocLoading;
  const displayCount = view === 'allocated' ? sortedAlloc.length : sortedUnalloc.length;

  return (
    <div className="flex min-h-screen bg-cream-base">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-5">
          <h1 className="text-2xl text-ink-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Students
          </h1>
        </div>

        {/* View Toggle — permanent */}
        <ViewToggle
          view={view}
          allocCount={allocLoading ? null : allocStudents.length}
          unallocCount={unallocLoading ? null : unallocStudents.length}
          onChange={handleViewChange}
        />

        {fetchError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-mono break-all">
            {fetchError}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {view === 'allocated' && (
            <FloorDropdown value={selectedFloor} onChange={handleFloorChange} />
          )}

          <input
            type="text"
            placeholder={view === 'allocated'
              ? 'Search NUS ID, faculty, or archetype…'
              : 'Search NUS ID, faculty, or race…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white border border-gray-200 text-ink-primary text-sm shadow-sm outline-none focus:border-purple-primary transition-colors w-72"
          />

          <span className="text-sm text-ink-muted ml-auto">
            {isLoading ? '—' : `${displayCount} student${displayCount !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* ── Allocated Table ─────────────────────────────────────────────── */}
        {view === 'allocated' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid gap-3 px-5 py-3 border-b border-purple-light/60"
              style={{ gridTemplateColumns: '90px 1fr 56px 72px 90px 110px 76px 36px' }}>
              <AllocHeader field="nus_id"             label="NUS ID"      />
              <AllocHeader field="faculty"            label="Faculty"     />
              <AllocHeader field="floor_number"       label="Floor"       align="center" />
              <AllocHeader field="unit_number"        label="Room"        align="center" />
              <AllocHeader field="room_type_assigned" label="Room Type"   />
              <AllocHeader field="archetype"          label="Archetype"   />
              <AllocHeader field="floor_score"        label="Floor Score" align="right" />
              <AllocHeader field="is_locked"          label="🔒"           align="center" />
            </div>

            {allocLoading ? (
              <div className="flex items-center justify-center h-48 text-ink-muted text-sm gap-2">
                <Spinner /> Loading…
              </div>
            ) : sortedAlloc.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-ink-muted text-sm">
                {allocStudents.length === 0
                  ? 'No allocation run yet — run the algorithm first.'
                  : 'No students match the filter.'}
              </div>
            ) : (
              <div className="divide-y divide-purple-light/30">
                {sortedAlloc.map(s => (
                  <div key={s.nus_id}>
                    <div className="grid gap-3 px-5 py-3 hover:bg-purple-light/20 transition-colors text-sm cursor-pointer"
                      style={{ gridTemplateColumns: '90px 1fr 56px 72px 90px 110px 76px 36px' }}
                      onClick={() => setExpanded(expanded === s.nus_id ? null : s.nus_id)}>
                      <span className="font-mono text-xs text-ink-primary font-medium self-center truncate">{s.nus_id}</span>
                      <span className="min-w-0 text-ink-primary truncate self-center">{s.faculty ?? '—'}</span>
                      <span className="text-center text-ink-primary font-medium self-center flex items-center justify-center gap-1">
                        L{s.floor_number}
                        {(s.floor_number === 9 || s.floor_number === 17) && (
                          <WheelchairIcon size={10} className="text-ink-muted" />
                        )}
                      </span>
                      <span className="text-center font-mono text-xs text-ink-primary self-center">
                        {s.unit_number ? `${s.floor_number}-${s.unit_number}` : '—'}
                      </span>
                      <span className="text-ink-muted capitalize self-center truncate">
                        {s.room_type_assigned.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-1.5 self-center">
                        <div className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: ARCHETYPE_COLORS[s.archetype] ?? '#6B7280' }} />
                        <span className="text-ink-primary capitalize text-xs">{s.archetype}</span>
                      </div>
                      <span className="text-right font-semibold self-center" style={{ color: scoreColor(s.floor_score) }}>
                        {s.floor_score.toFixed(2)}
                      </span>
                      <span className="text-center self-center text-xs text-ink-muted">
                        {s.is_locked ? '🔒' : ''}
                      </span>
                    </div>
                    {expanded === s.nus_id && (
                      <div className="px-5 pb-3 bg-purple-light/10 border-t border-purple-light/30">
                        <p className="pt-2.5 text-xs text-ink-muted leading-relaxed">
                          <span className="font-semibold text-ink-primary">Placement rationale: </span>
                          {s.placement_rationale}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Unallocated Table ────────────────────────────────────────────── */}
        {view === 'unallocated' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid gap-3 px-5 py-3 border-b border-purple-light/60"
              style={{ gridTemplateColumns: '90px 1fr 100px 110px 140px 36px' }}>
              <UnallocHeader field="nus_id"                 label="NUS ID"    />
              <UnallocHeader field="faculty"                label="Faculty"   />
              <UnallocHeader field="race"                   label="Race"      />
              <UnallocHeader field="sleep_schedule"         label="Sleep"     />
              <UnallocHeader field="submitted_at"           label="Submitted" align="right" />
              <UnallocHeader field="requires_accessibility" label="♿"         align="center" />
            </div>

            {unallocLoading ? (
              <div className="flex items-center justify-center h-48 text-ink-muted text-sm gap-2">
                <Spinner /> Loading…
              </div>
            ) : sortedUnalloc.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-ink-muted text-sm">
                {unallocStudents.length === 0
                  ? 'No pending students — everyone has been allocated.'
                  : 'No students match the search.'}
              </div>
            ) : (
              <div className="divide-y divide-purple-light/30">
                {sortedUnalloc.map(s => (
                  <div key={s.nus_id} className="grid gap-3 px-5 py-3 text-sm"
                    style={{ gridTemplateColumns: '90px 1fr 100px 110px 140px 36px' }}>
                    <span className="font-mono text-xs text-ink-primary font-medium self-center">{s.nus_id}</span>
                    <span className="text-ink-primary truncate self-center">{s.faculty ?? '—'}</span>
                    <span className="text-ink-muted self-center">{s.race ?? '—'}</span>
                    <span className="text-ink-muted text-xs self-center">
                      {s.sleep_schedule !== null ? sleepLabel(s.sleep_schedule) : '—'}
                    </span>
                    <span className="text-right text-ink-muted text-xs self-center">
                      {formatDate(s.submitted_at)}
                    </span>
                    <span className="flex items-center justify-center self-center text-ink-muted">
                      {s.requires_accessibility && <WheelchairIcon size={13} />}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isLoading && displayCount > 0 && (
          <p className="mt-3 text-xs text-ink-muted">
            {view === 'allocated'
              ? 'Click any row to see placement rationale. Click column headers to sort.'
              : 'Click column headers to sort.'}
          </p>
        )}
      </main>
    </div>
  );
}

// ─── Page Export ─────────────────────────────────────────────────────────────

export default function StudentsPage() {
  return (
    <Suspense>
      <StudentsContent />
    </Suspense>
  );
}
