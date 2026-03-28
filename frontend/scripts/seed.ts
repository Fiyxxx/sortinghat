/**
 * Seed 500 synthetic student profiles and run a locked allocation for 250 returners.
 * Run with: npm run db:seed
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { runSeed } from '../lib/seed-logic';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, anonKey);
const admin    = svcKey ? createClient(url, svcKey) : supabase;

runSeed(supabase, admin)
  .then(() => console.log('✓ Seed complete.'))
  .catch(err => { console.error(err.message); process.exit(1); });
