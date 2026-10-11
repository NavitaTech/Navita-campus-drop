'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SiteFooter, SiteHeader } from './Brand'
import { useLang } from './LangProvider'

export function SuccessView() {
  const { t } = useLang()
  const ref = useSearchParams().get('ref') ?? ''

  return (
    <div className="min-h-dvh">
      <SiteHeader showApply={false} />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6">
        <span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <svg viewBox="0 0 24 24" fill="none" className="size-8" aria-hidden>
            <path
              d="m5 13 4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <h1 className="mt-6 text-3xl font-bold text-navy">{t.success.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{t.success.body}</p>

        {ref && (
          <div className="mt-8 w-full rounded-brand border border-grey bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-muted">{t.success.refLabel}</p>
            <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-orange" dir="ltr">
              {ref}
            </p>
            <p className="mt-2 text-xs text-muted">{t.success.keep}</p>
          </div>
        )}

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/apply"
            className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-bold text-navy transition hover:bg-navy-050"
          >
            {t.success.another}
          </Link>
          <Link
            href="/"
            className="rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:bg-navy-600"
          >
            {t.success.home}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
