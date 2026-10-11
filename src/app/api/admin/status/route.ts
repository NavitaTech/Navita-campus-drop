import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { currentUser } from '@/lib/auth-server'
import { STATUSES } from '@/lib/options'

export const runtime = 'nodejs'

/** Updates an application's status and/or appends an HR note, logging both. */
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role === 'viewer') {
    return NextResponse.json({ error: 'Read-only account.' }, { status: 403 })
  }

  const { id, status, note } = await req.json().catch(() => ({}))
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: 'Missing application id.' }, { status: 400 })
  }

  const newStatus =
    typeof status === 'string' && (STATUSES as readonly string[]).includes(status) ? status : null
  const text = typeof note === 'string' && note.trim() ? note.trim() : null

  if (!newStatus && !text) {
    return NextResponse.json({ error: 'Nothing to save.' }, { status: 400 })
  }

  const sb = db()
  const { data: existing } = await sb
    .from('application')
    .select('status')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
  }

  const changed = newStatus !== null && newStatus !== existing.status

  if (changed) {
    const { error } = await sb.from('application').update({ status: newStatus }).eq('id', id)
    if (error) {
      console.error('status update failed', error)
      return NextResponse.json({ error: 'Could not update the status.' }, { status: 500 })
    }
  }

  const { error: noteErr } = await sb.from('application_note').insert({
    application_id: id,
    admin_user_id: user.sub,
    note: text,
    old_status: changed ? existing.status : null,
    new_status: changed ? newStatus : null,
  })

  if (noteErr) {
    console.error('note insert failed', noteErr)
    return NextResponse.json({ error: 'Could not save the note.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
