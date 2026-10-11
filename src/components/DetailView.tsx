'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AdminHeader, StatusChip } from './AdminChrome'
import { useLang } from './LangProvider'
import { STATUSES } from '@/lib/options'
import type { Application, ApplicationNote } from '@/lib/types'

type Joined = Application & {
  department: { name_ar: string; name_en: string } | null
  position: { title_ar: string; title_en: string } | null
}

export function DetailView({
  user,
  app,
  notes,
  canEdit,
}: {
  user: { name: string }
  app: Joined
  notes: (ApplicationNote & { author: string | null })[]
  canEdit: boolean
}) {
  const { t, lang } = useLang()
  const router = useRouter()

  const [status, setStatus] = useState(app.status)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const dash = t.admin.detail.none
  const isMasters = app.application_type === 'masters'
  const M = (k: string) => (t.masters.f as Record<string, string>)[k] ?? k
  const L = (k: string) => (t.form.f as Record<string, string>)[k] ?? k
  const O = (group: Record<string, string>, key: string | null) => (key ? (group[key] ?? key) : dash)

  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : dash

  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  async function save() {
    if (!canEdit) return
    if (status === app.status && !note.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: app.id, status, note }),
    })
    setSaving(false)
    if (res.ok) {
      setNote('')
      router.refresh()
    }
  }

  return (
    <div className="min-h-dvh">
      <AdminHeader user={user} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href="/admin" className="text-sm font-semibold text-navy hover:text-orange">
          ← {t.admin.detail.back}
        </Link>

        {/* Header card */}
        <div className="mt-4 rounded-brand border border-grey bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-sm font-bold text-orange" dir="ltr">
                {app.reference_code}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-navy">
                {lang === 'ar' ? app.full_name_ar : app.full_name_en}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {isMasters
                  ? [app.target_program, app.target_country].filter(Boolean).join(' · ') || dash
                  : app.position
                    ? lang === 'ar'
                      ? app.position.title_ar
                      : app.position.title_en
                    : (app.position_other ?? dash)}
                {!isMasters &&
                  app.department &&
                  ` · ${lang === 'ar' ? app.department.name_ar : app.department.name_en}`}
              </p>
              <p className="mt-2 text-xs text-muted">
                {t.admin.detail.submittedOn} {fmtDateTime(app.submitted_at)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                    isMasters
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      : 'bg-navy/10 text-navy ring-navy/20'
                  }`}
                >
                  {(t.admin.type as Record<string, string>)[app.application_type]}
                </span>
                <StatusChip status={app.status} />
              </div>
              {app.cv_path ? (
                <a
                  href={`/api/admin/cv/${app.id}`}
                  className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-600"
                >
                  {t.admin.detail.download}
                </a>
              ) : (
                <span className="text-sm text-muted">{t.admin.detail.noCv}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Fields */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Group title={t.form.sec.personal}>
              <Row k={L('full_name_ar')} v={app.full_name_ar} />
              <Row k={L('full_name_en')} v={app.full_name_en} ltr />
              <Row k={L('email')} v={app.email} ltr />
              <Row k={L('phone')} v={app.phone} ltr />
              <Row k={L('whatsapp')} v={app.whatsapp} ltr />
              <Row k={L('national_id')} v={app.national_id} ltr />
              <Row k={L('nationality')} v={app.nationality} />
              <Row k={L('gender')} v={O(t.form.opt.gender, app.gender)} />
              <Row k={L('date_of_birth')} v={fmtDate(app.date_of_birth)} />
              <Row k={L('marital_status')} v={O(t.form.opt.marital, app.marital_status)} />
              <Row k={L('country')} v={app.country} />
              <Row k={L('city')} v={app.city} />
              <Row k={L('address')} v={app.address} wide />
            </Group>

            {isMasters ? (
              <Group title={t.masters.sec.study}>
                <Row k={M('target_country')} v={app.target_country} />
                <Row k={M('target_program')} v={app.target_program} />
                <Row k={M('intake_term')} v={app.intake_term} />
                <Row k={M('study_mode')} v={O(t.masters.opt.study_mode, app.study_mode)} />
                <Row k={M('funding_source')} v={O(t.masters.opt.funding, app.funding_source)} />
                <Row k={M('budget')} v={app.budget} ltr />
                <Row k={M('target_universities')} v={app.target_universities} wide />
              </Group>
            ) : (
              <Group title={t.form.sec.position}>
                <Row k={L('employment_type')} v={O(t.form.opt.employment, app.employment_type)} />
                <Row k={L('expected_salary')} v={app.expected_salary} ltr />
                <Row k={L('available_from')} v={fmtDate(app.available_from)} />
                <Row k={L('heard_about_us')} v={O(t.form.opt.heard, app.heard_about_us)} />
                <Row k={L('position_other')} v={app.position_other} wide />
              </Group>
            )}

            <Group title={t.form.sec.education}>
              <Row k={L('edu_level')} v={O(t.form.opt.edu, app.edu_level)} />
              <Row k={L('major')} v={app.major} />
              <Row k={L('university')} v={app.university} />
              <Row k={L('graduation_year')} v={app.graduation_year} ltr />
              <Row k={L('gpa')} v={app.gpa} ltr />
            </Group>

            {isMasters ? (
              <Group title={t.masters.sec.language}>
                <Row k={M('english_test')} v={O(t.masters.opt.english_test, app.english_test)} />
                <Row k={M('english_score')} v={app.english_score} ltr />
                <Row k={L('english_level')} v={O(t.form.opt.level, app.english_level)} />
                <Row k={L('arabic_level')} v={O(t.form.opt.level, app.arabic_level)} />
                <Row k={M('passport_number')} v={app.passport_number} ltr />
                <Row k={M('passport_expiry')} v={fmtDate(app.passport_expiry)} />
                <Row
                  k={M('previous_visa_refusal')}
                  v={app.previous_visa_refusal ? t.admin.detail.yes : t.admin.detail.no}
                />
                <Row
                  k={L('years_experience')}
                  v={
                    app.years_experience === null
                      ? dash
                      : `${app.years_experience} ${t.admin.detail.years}`
                  }
                />
                <Row k={M('visa_refusal_details')} v={app.visa_refusal_details} wide />
              </Group>
            ) : (
              <Group title={t.form.sec.experience}>
                <Row
                  k={L('years_experience')}
                  v={
                    app.years_experience === null
                      ? dash
                      : `${app.years_experience} ${t.admin.detail.years}`
                  }
                />
                <Row k={L('current_employer')} v={app.current_employer} />
                <Row k={L('current_title')} v={app.current_title} />
                <Row k={L('current_salary')} v={app.current_salary} ltr />
                <Row k={L('notice_period')} v={app.notice_period} />
              </Group>
            )}

            {!isMasters && (
            <Group title={t.form.sec.skills}>
              <Row k={L('arabic_level')} v={O(t.form.opt.level, app.arabic_level)} />
              <Row k={L('english_level')} v={O(t.form.opt.level, app.english_level)} />
              <Row
                k={L('driving_license')}
                v={app.driving_license ? t.admin.detail.yes : t.admin.detail.no}
              />
              <Row
                k={L('willing_relocate')}
                v={app.willing_relocate ? t.admin.detail.yes : t.admin.detail.no}
              />
              <Row k={L('residency_status')} v={app.residency_status} />
              <Row k={L('computer_skills')} v={app.computer_skills} wide />
              <Row k={L('certifications')} v={app.certifications} wide />
              <Row k={L('cover_letter')} v={app.cover_letter} wide />
            </Group>
            )}

            {isMasters && (
              <Group title={t.masters.sec.docs}>
                <Row k={M('notes')} v={app.cover_letter} wide />
              </Group>
            )}
          </div>

          {/* Status + notes */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-brand border border-grey bg-white p-5 shadow-sm">
              <h2 className="font-bold text-navy">{t.admin.detail.changeStatus}</h2>
              <div className="brand-rule mt-3 mb-4 w-full" />

              <select
                value={status}
                disabled={!canEdit}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-xl border border-grey bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15 disabled:bg-grey/40"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {(t.admin.status as Record<string, string>)[s]}
                  </option>
                ))}
              </select>

              <textarea
                rows={4}
                value={note}
                disabled={!canEdit}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.admin.detail.addNote}
                className="mt-3 w-full resize-y rounded-xl border border-grey bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15 disabled:bg-grey/40"
              />

              <button
                type="button"
                onClick={save}
                disabled={!canEdit || saving || (status === app.status && !note.trim())}
                className="mt-3 w-full rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? t.admin.detail.saving : t.admin.detail.save}
              </button>
            </div>

            <div className="rounded-brand border border-grey bg-white p-5 shadow-sm">
              <h2 className="font-bold text-navy">{t.admin.detail.history}</h2>
              <div className="brand-rule mt-3 mb-4 w-full" />

              {notes.length === 0 ? (
                <p className="text-sm text-muted">{t.admin.detail.noNotes}</p>
              ) : (
                <ol className="flex flex-col gap-4">
                  {notes.map((n) => (
                    <li key={n.id} className="border-s-2 border-grey ps-3">
                      <p className="text-xs text-muted">
                        {fmtDateTime(n.created_at)}
                        {n.author && ` · ${n.author}`}
                      </p>
                      {n.new_status && (
                        <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                          {n.old_status && <StatusChip status={n.old_status} />}
                          <span className="text-muted">→</span>
                          <StatusChip status={n.new_status} />
                        </p>
                      )}
                      {n.note && <p className="mt-1.5 text-sm text-ink">{n.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-brand border border-grey bg-white p-6 shadow-sm">
      <h2 className="font-bold text-navy">{title}</h2>
      <div className="brand-rule mt-3 mb-5 w-full" />
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</dl>
    </section>
  )
}

function Row({
  k,
  v,
  ltr,
  wide,
}: {
  k: string
  v: string | number | null | undefined
  ltr?: boolean
  wide?: boolean
}) {
  const empty = v === null || v === undefined || v === ''
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs font-semibold text-muted">{k}</dt>
      <dd
        dir={ltr ? 'ltr' : undefined}
        className={`mt-1 whitespace-pre-wrap text-[15px] ${empty ? 'text-muted' : 'text-ink'}`}
      >
        {empty ? '—' : v}
      </dd>
    </div>
  )
}
