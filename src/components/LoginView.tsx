'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LangToggle, Logo } from './Brand'
import { useLang } from './LangProvider'

export function LoginView() {
  const { t } = useLang()
  const router = useRouter()
  const next = useSearchParams().get('next') || '/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      router.replace(next)
      router.refresh()
    } else {
      setError(t.admin.loginError)
      setBusy(false)
    }
  }

  const input =
    'w-full rounded-xl border border-grey bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/15'

  return (
    <div className="grid min-h-dvh place-items-center bg-navy px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex justify-end">
          <LangToggle subtle />
        </div>

        <div className="rounded-brand bg-white p-7 shadow-xl">
          <Logo className="mx-auto h-11 w-auto" />
          <div className="brand-rule mx-auto mt-5 w-28" />

          <h1 className="mt-5 text-center text-xl font-bold text-navy">{t.admin.loginTitle}</h1>
          <p className="mt-1 text-center text-sm text-muted">{t.admin.loginSubtitle}</p>

          <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="u" className="text-sm font-semibold text-navy">
                {t.admin.username}
              </label>
              <input
                id="u"
                dir="ltr"
                autoComplete="username"
                required
                className={input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="p" className="text-sm font-semibold text-navy">
                {t.admin.password}
              </label>
              <input
                id="p"
                type="password"
                dir="ltr"
                autoComplete="current-password"
                required
                className={input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-full bg-orange px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {busy ? t.admin.loggingIn : t.admin.login}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
