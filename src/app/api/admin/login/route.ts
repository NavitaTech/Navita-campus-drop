import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/supabase'
import { SESSION_COOKIE, cookieOptions, signSession } from '@/lib/session'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}))

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return NextResponse.json({ error: 'Missing credentials.' }, { status: 400 })
  }

  const sb = db()
  const { data: user } = await sb
    .from('admin_user')
    .select('id, username, password_hash, full_name, role, is_active')
    .eq('username', username.trim().toLowerCase())
    .maybeSingle()

  // Same response whether the user is unknown, inactive or the password is
  // wrong, so the endpoint can't be used to enumerate accounts.
  const ok = user?.is_active ? await bcrypt.compare(password, user.password_hash) : false
  if (!ok || !user) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  const token = await signSession({
    sub: user.id,
    username: user.username,
    name: user.full_name,
    role: user.role,
  })

  await sb.from('admin_user').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, cookieOptions)
  return res
}
