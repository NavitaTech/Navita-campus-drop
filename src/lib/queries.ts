import { db } from './supabase'

export type Filters = { q?: string; dep?: string; status?: string; type?: string }

export const LIST_COLUMNS = `
  id, reference_code, application_type, status, full_name_ar, full_name_en, phone, email,
  years_experience, submitted_at, cv_path, department_id, position_id, position_other,
  target_country, target_program,
  department:department_id ( name_ar, name_en ),
  position:position_id ( title_ar, title_en )
`

/**
 * PostgREST's `or=` takes a comma-separated list inside parentheses, so those
 * characters (plus the `*` wildcard) have to come out of user input.
 */
function sanitise(q: string) {
  return q.replace(/[,()*\\]/g, ' ').trim()
}

export function applyFilters<T extends { or: Function; eq: Function }>(
  query: T,
  { q, dep, status, type }: Filters,
): T {
  let out = query
  if (dep) out = out.eq('department_id', Number(dep)) as T
  if (status) out = out.eq('status', status) as T
  if (type) out = out.eq('application_type', type) as T

  const term = q ? sanitise(q) : ''
  if (term) {
    out = out.or(
      [
        `reference_code.ilike.*${term}*`,
        `target_program.ilike.*${term}*`,
        `full_name_ar.ilike.*${term}*`,
        `full_name_en.ilike.*${term}*`,
        `email.ilike.*${term}*`,
        `phone.ilike.*${term}*`,
      ].join(','),
    ) as T
  }
  return out
}

export async function listApplications(filters: Filters, limit = 500) {
  const sb = db()
  const base = sb.from('application').select(LIST_COLUMNS).order('submitted_at', { ascending: false }).limit(limit)
  const { data, error } = await applyFilters(base as never, filters)
  if (error) throw error
  return data ?? []
}

export async function getStats() {
  const sb = db()
  const count = (b: { count: number | null }) => b.count ?? 0
  const [total, fresh, jobs, masters] = await Promise.all([
    sb.from('application').select('id', { count: 'exact', head: true }),
    sb.from('application').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    sb.from('application').select('id', { count: 'exact', head: true }).eq('application_type', 'job'),
    sb.from('application').select('id', { count: 'exact', head: true }).eq('application_type', 'masters'),
  ])

  return {
    total: count(total),
    fresh: count(fresh),
    jobs: count(jobs),
    masters: count(masters),
  }
}
