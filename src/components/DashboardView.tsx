'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminHeader, StatusChip } from './AdminChrome'
import { useLang } from './LangProvider'
import { APPLICATION_TYPES, STATUSES } from '@/lib/options'
import type { Department } from '@/lib/types'

export type Row = {
  id: string
  reference_code: string
  application_type: string
  status: string
  full_name_ar: string
  full_name_en: string
  phone: string
  email: string
  years_experience: number | null
  submitted_at: string
  cv_path: string | null
  department_id: number | null
  position_id: number | null
  department: { name_ar: string; name_en: string } | null
  position: { title_ar: string; title_en: string } | null
  position_other: string | null
  target_country: string | null
  target_program: string | null
}

export type Stats = { total: number; fresh: number; jobs: number; masters: number }

export function DashboardView({
  user,
  rows,
  departments,
  stats,
}: {
  user: { name: string }
  rows: Row[]
  departments: Department[]
  stats: Stats
}) {
  const { t, lang } = useLang()
  const router = useRouter()
  const params = useSearchParams()

  const q = params.get('q') ?? ''
  const dep = params.get('dep') ?? ''
  const status = params.get('status') ?? ''
  const type = params.get('type') ?? ''

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`/admin?${next.toString()}`)
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const control =
    'rounded-xl border border-grey bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/15'

  const cards: { label: string; value: number; tone: string }[] = [
    { label: t.admin.total, value: stats.total, tone: 'text-navy' },
    { label: t.admin.newCount, value: stats.fresh, tone: 'text-orange' },
    { label: t.admin.jobsCount, value: stats.jobs, tone: 'text-navy' },
    { label: t.admin.mastersCount, value: stats.masters, tone: 'text-emerald-600' },
  ]

  return (
    <div className="min-h-dvh">
      <AdminHeader user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">{t.admin.title}</h1>
            <div className="brand-rule mt-3 w-32" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/qr"
              className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-navy-050"
            >
              {t.admin.qrPage}
            </Link>
            <a
              href={`/api/admin/export?${params.toString()}`}
              className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-600"
            >
              {t.admin.export}
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-brand border border-grey bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-muted">{c.label}</p>
              <p className={`mt-2 text-3xl font-bold ${c.tone}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-7 flex flex-wrap gap-3">
          <input
            defaultValue={q}
            placeholder={t.admin.search}
            className={`${control} min-w-0 flex-1 sm:min-w-[18rem]`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setParam('q', (e.target as HTMLInputElement).value.trim())
            }}
            onBlur={(e) => setParam('q', e.target.value.trim())}
          />
          <select value={type} onChange={(e) => setParam('type', e.target.value)} className={control}>
            <option value="">{t.admin.allTypes}</option>
            {APPLICATION_TYPES.map((k) => (
              <option key={k} value={k}>
                {(t.admin.type as Record<string, string>)[k]}
              </option>
            ))}
          </select>
          <select value={dep} onChange={(e) => setParam('dep', e.target.value)} className={control}>
            <option value="">{t.admin.allDepartments}</option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {lang === 'ar' ? d.name_ar : d.name_en}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
            className={control}
          >
            <option value="">{t.admin.allStatuses}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {(t.admin.status as Record<string, string>)[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-brand border border-grey bg-white shadow-sm">
          {rows.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-muted">{t.admin.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-navy-050 text-start">
                  <tr>
                    {[
                      t.admin.col.ref,
                      t.admin.col.type,
                      t.admin.col.name,
                      t.admin.col.position,
                      t.admin.col.phone,
                      t.admin.col.experience,
                      t.admin.col.status,
                      t.admin.col.date,
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-start font-bold text-navy"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => router.push(`/admin/${r.id}`)}
                      className="cursor-pointer border-t border-grey transition hover:bg-mist"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-orange" dir="ltr">
                        {r.reference_code}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                            r.application_type === 'masters'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-navy/10 text-navy ring-navy/20'
                          }`}
                        >
                          {(t.admin.type as Record<string, string>)[r.application_type] ??
                            r.application_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy">
                        {lang === 'ar' ? r.full_name_ar : r.full_name_en}
                        <span className="block text-xs font-normal text-muted" dir="ltr">
                          {r.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {r.application_type === 'masters'
                          ? (r.target_program ?? '—')
                          : r.position
                            ? lang === 'ar'
                              ? r.position.title_ar
                              : r.position.title_en
                            : (r.position_other ?? '—')}
                        <span className="block text-xs text-muted">
                          {r.application_type === 'masters'
                            ? (r.target_country ?? '')
                            : r.department
                              ? lang === 'ar'
                                ? r.department.name_ar
                                : r.department.name_en
                              : ''}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink" dir="ltr">
                        {r.phone}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink">
                        {r.years_experience ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={r.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {fmtDate(r.submitted_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
