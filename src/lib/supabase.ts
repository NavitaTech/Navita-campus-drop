import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Server-only Supabase client, bound to the `careers` schema.
 *
 * Everything the app does against the database goes through the service-role
 * key on the server: the public form posts to a route handler, and the HR
 * pages run server-side behind the session cookie. The key is never shipped to
 * the browser, so RLS on the careers tables stays fully closed.
 */
export function db() {
  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }
  return createClient(url, serviceKey, {
    db: { schema: 'careers' },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Same project, default `public` schema — used only for Storage. */
export function storage() {
  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage
}

export const CV_BUCKET = 'careers-cv'
