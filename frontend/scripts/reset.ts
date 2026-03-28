/**
 * Wipe all data and re-seed.
 * Run with: npm run db:reset
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const url    = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !svcKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required in .env.local to reset the database.');
  process.exit(1);
}

const admin = createClient(url, svcKey);

async function reset() {
  console.log('Wiping student_allocations…');
  const { error: a } = await admin.from('student_allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (a) { console.error(a.message); process.exit(1); }

  console.log('Wiping allocation_runs…');
  const { error: r } = await admin.from('allocation_runs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (r) { console.error(r.message); process.exit(1); }

  console.log('Wiping student_profiles…');
  const { error: p } = await admin.from('student_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (p) { console.error(p.message); process.exit(1); }

  console.log('✓ All tables wiped.\n');
  console.log('Re-seeding…\n');

  execSync('npx tsx scripts/seed.ts', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
}

reset().catch(err => { console.error(err); process.exit(1); });
