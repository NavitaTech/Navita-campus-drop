import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'navita_hr'
const MAX_AGE = 60 * 60 * 8 // 8 hours

export type Session = {
  sub: string
  username: string
  name: string
  role: 'admin' | 'hr' | 'viewer'
}

function secret() {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('Missing SESSION_SECRET env var.')
  return new TextEncoder().encode(s)
}

export async function signSession(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
}

export async function readSession(token?: string): Promise<Session | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    return {
      sub: String(payload.sub ?? payload.id ?? ''),
      username: String(payload.username ?? ''),
      name: String(payload.name ?? ''),
      role: (payload.role as Session['role']) ?? 'viewer',
    }
  } catch {
    return null
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
}
