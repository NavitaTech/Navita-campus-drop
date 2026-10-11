'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox, Input, Section, Select, Textarea, Wide } from './Field'
import { CvUpload } from './CvUpload'
import { useLang } from './LangProvider'
import { PERSONAL_DEFAULTS, PERSONAL_REQUIRED, PersonalStep, type Values } from './PersonalStep'
import { EDU, EMPLOYMENT, HEARD, LEVELS } from '@/lib/options'
import type { Department, Position } from '@/lib/types'

const EMPTY: Values = {
  ...PERSONAL_DEFAULTS,
  department_id: '', position_id: '', position_other: '', employment_type: '',
  expected_salary: '', available_from: '', heard_about_us: '',
  edu_level: '', major: '', university: '', graduation_year: '', gpa: '',
  years_experience: '', current_employer: '', current_title: '', current_salary: '',
  notice_period: '',
  arabic_level: '', english_level: '', computer_skills: '', certifications: '',
  driving_license: false, willing_relocate: false, residency_status: '',
  cover_letter: '', consent: false,
}

/** Fields that must be filled before each step can be left. */
const REQUIRED_BY_STEP: string[][] = [
  PERSONAL_REQUIRED,
  ['department_id'],
  [],
  [],
]

export function ApplyForm({
  departments,
  positions,
}: {
  departments: Department[]
  positions: Position[]
}) {
  const { t, lang } = useLang()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [v, setV] = useState<Values>(EMPTY)
  const [cv, setCv] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const val = target.type === 'checkbox' ? target.checked : target.value
    setV((prev) => ({ ...prev, [k]: val }))
    setErrors((prev) => (prev[k] ? { ...prev, [k]: '' } : prev))
  }

  const opts = (o: readonly string[], map: Record<string, string>) =>
    o.map((k) => ({ value: k, label: map[k] ?? k }))

  const depOptions = departments.map((d) => ({
    value: String(d.id),
    label: lang === 'ar' ? d.name_ar : d.name_en,
  }))

  const posOptions = useMemo(() => {
    const depId = Number(v.department_id)
    return positions
      .filter((p) => !depId || p.department_id === depId)
      .map((p) => ({ value: String(p.id), label: lang === 'ar' ? p.title_ar : p.title_en }))
  }, [positions, v.department_id, lang])

  function validateStep(s: number): boolean {
    const next: Record<string, string> = {}
    for (const k of REQUIRED_BY_STEP[s]) {
      if (!String(v[k] ?? '').trim()) next[k] = t.form.required
    }
    if (s === 0 && String(v.email).trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v.email))) {
      next.email = t.form.err.email
    }
    if (s === 3) {
      if (!cv) next.cv = t.form.required
      if (!v.consent) next.consent = t.form.err.consent
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goPrev() {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    // Re-check every step, not just the last one — a visitor can reach step 4
    // and then clear a required field on an earlier step.
    for (let s = 0; s <= 3; s++) {
      if (!validateStep(s)) {
        setStep(s)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(v).forEach(([k, val]) => fd.append(k, String(val)))
      fd.append('application_type', 'job')
      fd.append('locale', lang)
      if (cv) fd.append('cv', cv)

      const res = await fetch('/api/apply', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setFormError(data?.error || t.form.err.generic)
        setSubmitting(false)
        return
      }
      router.push(`/apply/success?ref=${encodeURIComponent(data.reference_code)}`)
    } catch {
      setFormError(t.form.err.generic)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="rounded-brand border border-grey bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-navy">
          <span>
            {t.form.progress} {step + 1} {t.form.of} 4
          </span>
          <span className="text-muted">{t.form.steps[step]}</span>
        </div>
        <div className="flex gap-2">
          {t.form.steps.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition ${
                  i < step ? 'bg-navy' : i === step ? 'bg-orange' : 'bg-grey'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {step === 0 && <PersonalStep v={v} set={set} errors={errors} />}

      {step === 1 && (
        <Section title={t.form.sec.position}>
          <Select label={t.form.f.department} required placeholder={t.form.select} options={depOptions} value={String(v.department_id)} onChange={(e) => { set('department_id')(e); setV((p) => ({ ...p, position_id: '' })) }} error={errors.department_id} />
          <Select label={t.form.f.position} placeholder={t.form.select} options={posOptions} value={String(v.position_id)} onChange={set('position_id')} />
          <Input label={t.form.f.position_other} hint={t.form.optional} value={String(v.position_other)} onChange={set('position_other')} />
          <Select label={t.form.f.employment_type} placeholder={t.form.select} options={opts(EMPLOYMENT, t.form.opt.employment)} value={String(v.employment_type)} onChange={set('employment_type')} />
          <Input label={t.form.f.expected_salary} type="number" min="0" step="1" dir="ltr" value={String(v.expected_salary)} onChange={set('expected_salary')} />
          <Input label={t.form.f.available_from} type="date" value={String(v.available_from)} onChange={set('available_from')} />
          <Wide>
            <Select label={t.form.f.heard_about_us} placeholder={t.form.select} options={opts(HEARD, t.form.opt.heard)} value={String(v.heard_about_us)} onChange={set('heard_about_us')} />
          </Wide>
        </Section>
      )}

      {step === 2 && (
        <>
          <Section title={t.form.sec.education}>
            <Select label={t.form.f.edu_level} placeholder={t.form.select} options={opts(EDU, t.form.opt.edu)} value={String(v.edu_level)} onChange={set('edu_level')} />
            <Input label={t.form.f.major} value={String(v.major)} onChange={set('major')} />
            <Input label={t.form.f.university} value={String(v.university)} onChange={set('university')} />
            <Input label={t.form.f.graduation_year} type="number" min="1950" max="2100" dir="ltr" value={String(v.graduation_year)} onChange={set('graduation_year')} />
            <Input label={t.form.f.gpa} dir="ltr" value={String(v.gpa)} onChange={set('gpa')} placeholder="3.5 / 4" />
          </Section>

          <Section title={t.form.sec.experience}>
            <Input label={t.form.f.years_experience} type="number" min="0" step="0.5" dir="ltr" value={String(v.years_experience)} onChange={set('years_experience')} />
            <Input label={t.form.f.current_employer} value={String(v.current_employer)} onChange={set('current_employer')} />
            <Input label={t.form.f.current_title} value={String(v.current_title)} onChange={set('current_title')} />
            <Input label={t.form.f.current_salary} type="number" min="0" step="1" dir="ltr" value={String(v.current_salary)} onChange={set('current_salary')} />
            <Input label={t.form.f.notice_period} value={String(v.notice_period)} onChange={set('notice_period')} />
          </Section>
        </>
      )}

      {step === 3 && (
        <>
          <Section title={t.form.sec.skills}>
            <Select label={t.form.f.arabic_level} placeholder={t.form.select} options={opts(LEVELS, t.form.opt.level)} value={String(v.arabic_level)} onChange={set('arabic_level')} />
            <Select label={t.form.f.english_level} placeholder={t.form.select} options={opts(LEVELS, t.form.opt.level)} value={String(v.english_level)} onChange={set('english_level')} />
            <Input label={t.form.f.residency_status} value={String(v.residency_status)} onChange={set('residency_status')} />
            <div className="flex flex-col justify-center gap-3 pt-2">
              <Checkbox label={t.form.f.driving_license} checked={Boolean(v.driving_license)} onChange={set('driving_license')} />
              <Checkbox label={t.form.f.willing_relocate} checked={Boolean(v.willing_relocate)} onChange={set('willing_relocate')} />
            </div>
            <Wide>
              <Textarea label={t.form.f.computer_skills} rows={3} value={String(v.computer_skills)} onChange={set('computer_skills')} />
            </Wide>
            <Wide>
              <Textarea label={t.form.f.certifications} rows={3} value={String(v.certifications)} onChange={set('certifications')} />
            </Wide>
          </Section>

          <Section title={t.form.sec.attachments}>
            <Wide>
              <CvUpload file={cv} onChange={(f, err) => { setCv(f); setErrors((p) => ({ ...p, cv: err ?? '' })) }} error={errors.cv} />
            </Wide>
            <Wide>
              <Textarea label={t.form.f.cover_letter} rows={5} value={String(v.cover_letter)} onChange={set('cover_letter')} />
            </Wide>
            <Wide>
              <div className="rounded-xl bg-navy-050 p-4">
                <Checkbox label={t.form.f.consent} checked={Boolean(v.consent)} onChange={set('consent')} error={errors.consent} />
              </div>
            </Wide>
          </Section>
        </>
      )}

      {formError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {formError}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0}
          className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-navy-050 disabled:invisible"
        >
          {t.form.prev}
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-navy px-7 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-navy-600"
          >
            {t.form.next}
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-orange px-7 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
          >
            {submitting ? t.form.submitting : t.form.submit}
          </button>
        )}
      </div>
    </form>
  )
}
