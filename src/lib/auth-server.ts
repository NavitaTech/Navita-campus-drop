import { cookies } from 'next/headers'
import { SESSION_COOKIE, readSession, type Session } from './session'

/**
 * Reads the HR session inside a server component or route handler.
 * Kept out of `session.ts` because the middleware imports that module and
 * `next/headers` is not available in the edge runtime.
 */
export async function currentUser(): Promise<Session | null> {
  const jar = await cookies()
  return readSession(jar.get(SESSION_COOKIE)?.value)
}
