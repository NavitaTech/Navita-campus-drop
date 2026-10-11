'use client'

import Link from 'next/link'
import { ApplyForm } from './ApplyForm'
import { SiteFooter, SiteHeader } from './Brand'
import { useLang } from './LangProvider'
import type { Department, Position } from '@/lib/types'

export function ApplyView({
  departments,
  positions,
}: {
  departments: Department[]
  positions: Position[]
}) {
  const { t } = useLang()
  return (
    <div className="min-h-dvh">
      <SiteHeader showApply={false} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-navy hover:text-orange">
          ← {t.chooser.title}
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-navy">{t.form.title}</h1>
        <div className="brand-rule mt-3 w-40" />
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{t.form.subtitle}</p>

        <div className="mt-8">
          <ApplyForm departments={departments} positions={positions} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
