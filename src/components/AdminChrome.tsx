'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LangToggle, Logo } from './Brand'
import { useLang } from './LangProvider'
import { STATUS_STYLE, type Status } from '@/lib/options'

export function AdminHeader({ user }: { user: { name: string } }) {
  const { t } = useLang()
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <header className="no-print sticky top-0 z-30 border-b border-grey bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <Logo className="h-9 w-auto" />
          <span className="hidden text-sm font-bold text-navy sm:inline">{t.admin.loginTitle}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm font-semibold text-muted sm:inline">{user.name}</span>
          <LangToggle />
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-rose-200 px-4 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            {t.admin.logout}
          </button>
        </div>
      </div>
    </header>
  )
}

export function StatusChip({ status }: { status: string }) {
  const { t } = useLang()
  const label = (t.admin.status as Record<string, string>)[status] ?? status
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
        STATUS_STYLE[status as Status] ?? STATUS_STYLE.withdrawn
      }`}
    >
      {label}
    </span>
  )
}
