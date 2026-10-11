'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLang } from './LangProvider'

export function Logo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <Image
      src="/navita-logo.jpg"
      alt="Navita — Navigate Your Future"
      width={820}
      height={367}
      priority
      className={className}
    />
  )
}

export function LangToggle({ subtle = false }: { subtle?: boolean }) {
  const { t, toggle } = useLang()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.switchTo}
      className={
        subtle
          ? 'rounded-full border border-white/25 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10'
          : 'rounded-full border border-navy/20 px-3.5 py-1.5 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white'
      }
    >
      {t.switchTo}
    </button>
  )
}

/** Public site header: logo on white, language toggle, apply CTA. */
export function SiteHeader({ showApply = true }: { showApply?: boolean }) {
  const { t } = useLang()
  return (
    <header className="sticky top-0 z-30 border-b border-grey bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo className="h-9 w-auto sm:h-10" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <LangToggle />
          {showApply && (
            <Link
              href="/apply"
              className="rounded-full bg-orange px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 sm:px-5"
            >
              {t.nav.apply}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const { t } = useLang()
  const year = new Date().getFullYear()
  return (
    <footer className="mt-20 border-t border-grey bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-start">
        <Logo className="h-8 w-auto" />
        <p className="text-sm text-muted">
          © {year} {t.brand} — {t.footer}
        </p>
      </div>
    </footer>
  )
}
