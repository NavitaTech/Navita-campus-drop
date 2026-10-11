import { db } from './supabase'
import type { Department, Position } from './types'

/**
 * Departments and open positions, used by the home page and the form.
 * Returns empty lists rather than throwing so the public pages still render
 * if the database is briefly unreachable.
 */
export async function getCatalog(): Promise<{
  departments: Department[]
  positions: Position[]
}> {
  try {
    const sb = db()
    const [dep, pos] = await Promise.all([
      sb.from('department').select('*').eq('is_active', true).order('sort_order'),
      sb.from('position').select('*').eq('is_open', true).order('sort_order'),
    ])
    return {
      departments: (dep.data ?? []) as Department[],
      positions: (pos.data ?? []) as Position[],
    }
  } catch (err) {
    console.error('catalog fetch failed', err)
    return { departments: [], positions: [] }
  }
}
