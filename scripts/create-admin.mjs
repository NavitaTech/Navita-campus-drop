#!/usr/bin/env node
/**
 * Create or update an HR account.
 *
 *   node scripts/create-admin.mjs <username> <password> "<Full name>" [role]
 *
 * role: admin | hr | viewer   (default: hr)
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { readFileSync } from 'node:fs'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

try {
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  /* no .env — fall back to the real environment */
}

const [username, password, fullName, role = 'hr'] = process.argv.slice(2)

if (!username || !password || !fullName) {
  console.error('Usage: node scripts/create-admin.mjs <username> <password> "<Full name>" [admin|hr|viewer]')
  process.exit(1)
}
if (password.length < 10) {
  console.error('Password must be at least 10 characters.')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const sb = createClient(url, key, { db: { schema: 'careers' }, auth: { persistSession: false } })
const password_hash = await bcrypt.hash(password, 12)

const { error } = await sb
  .from('admin_user')
  .upsert(
    { username: username.toLowerCase(), password_hash, full_name: fullName, role, is_active: true },
    { onConflict: 'username' },
  )

if (error) {
  console.error('Failed:', error.message)
  process.exit(1)
}

console.log(`✓ HR account ready: ${username.toLowerCase()} (${role})`)
