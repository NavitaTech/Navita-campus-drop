#!/usr/bin/env node
/**
 * One-shot setup: stores the Supabase service-role key in .env.local together
 * with a generated session secret, then checks the database is reachable.
 *
 *   npm run setup              -> prompts for the key
 *   npm run setup -- <key>     -> takes it from the command line
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://veqcuykykoqyetnxpgjg.supabase.co'
const KEY_PAGE = 'https://supabase.com/dashboard/project/veqcuykykoqyetnxpgjg/settings/api-keys'

function looksLikeKey(k) {
  if (!k) return false
  if (k.startsWith('sb_secret_')) return k.length > 20
  // A real Supabase JWT has three dot-separated base64url segments.
  return /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(k)
}

let key = process.argv[2]?.trim() ?? ''

if (!looksLikeKey(key)) {
  if (key) console.error(`\n× That is not a complete key: "${key.slice(0, 24)}..."\n`)
  console.log('Open this page, click "Reveal" next to service_role, and copy the whole key:')
  console.log(`\n  ${KEY_PAGE}\n`)

  const rl = createInterface({ input: stdin, output: stdout })
  key = (await rl.question('Paste the service_role key here, then press Enter:\n> ')).trim()
  rl.close()
}

if (!looksLikeKey(key)) {
  console.error('\n× Still not a valid key. It should start with "eyJ" and contain two dots,')
  console.error('  or start with "sb_secret_". Nothing was changed.')
  process.exit(1)
}

// Reuse an existing SESSION_SECRET so signed-in HR sessions survive a re-run.
let secret = ''
if (existsSync('.env')) {
  secret = readFileSync('.env', 'utf8').match(/^SESSION_SECRET=(.+)$/m)?.[1]?.trim() ?? ''
}
if (!secret || secret.startsWith('dev-only')) secret = randomBytes(48).toString('base64url')

writeFileSync(
  '.env',
  [
    `NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`,
    `SUPABASE_SERVICE_ROLE_KEY=${key}`,
    `SESSION_SECRET=${secret}`,
    `NEXT_PUBLIC_SITE_URL=${process.env.SITE_URL || 'http://localhost:3100'}`,
    '',
  ].join('\n'),
)
console.log('\n✓ wrote .env')

const sb = createClient(SUPABASE_URL, key, {
  db: { schema: 'careers' },
  auth: { persistSession: false },
})

const [dep, pos, admin, apps] = await Promise.all([
  sb.from('department').select('id', { count: 'exact', head: true }),
  sb.from('position').select('id', { count: 'exact', head: true }),
  sb.from('admin_user').select('username'),
  sb.from('application').select('id', { count: 'exact', head: true }),
])

const bad = [dep, pos, admin, apps].find((r) => r.error)
if (bad) {
  const msg = bad.error.message || bad.error.hint || JSON.stringify(bad.error)
  console.error(`\n× Database check failed: ${msg}`)
  if (/JWT|api key|Invalid/i.test(msg)) {
    console.error('  The key was rejected — make sure you copied service_role, not anon.')
  }
  process.exit(1)
}

const { data: buckets, error: bErr } = await createClient(SUPABASE_URL, key, {
  auth: { persistSession: false },
}).storage.listBuckets()

console.log(`✓ departments:  ${dep.count}`)
console.log(`✓ positions:    ${pos.count}`)
console.log(`✓ applications: ${apps.count}`)
console.log(`✓ HR accounts:  ${admin.data.map((u) => u.username).join(', ')}`)
console.log(
  bErr
    ? `× storage check failed: ${bErr.message}`
    : `✓ CV bucket:    ${buckets.some((b) => b.id === 'careers-cv') ? 'careers-cv ready' : 'MISSING'}`,
)
console.log('\nAll set.')
