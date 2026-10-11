'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox, Input, Section, Select, Textarea, Wide } from './Field'
import { CvUpload } from './CvUpload'
import { PERSONAL_DEFAULTS, PERSONAL_REQUIRED, PersonalStep, type Values } from './PersonalStep'
import { useLang } from './LangProvider'
import { EDU, ENGLISH_TEST, FUNDING, LEVELS, STUDY_MODE } from '@/lib/options'

const EMPTY: Values = {
  ...PERSONAL_DEFAULTS,
  target_country: '', target_universities: '', target_program: '', intake_term: '',
  study_mode: '', funding_source: '', budget: '',
  edu_level: '', major: '', university: '', graduation_year: '', gpa: '',
  english_test: '', english_score: '', english_level: '', arabic_level: '',
  passport_number: '', passport_expiry: '',
  previous_visa_refusal: false, visa_refusal_details: '',
  years_experience: '', current_employer: '', current_title: '',
  cover_letter: '', consent: false,
}

const REQUIRED_BY_STEP: string[][] = [
  PERSONAL_REQUIRED,
  ['target_country', 'target_program'],
  [],
  [],
]

export function MastersForm() {
  const { t, lang } = useLang()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [v, setV] = useState<Values>(EMPTY)
  const [cv, setCv] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement
      setV((prev) => ({ ...prev, [k]: target.type === 'checkbox' ? target.checked : target.value }))
      setErrors((prev) => (prev[k] ? { ...prev, [k]: '' } : prev))
    }

  const opts = (keys: readonly string[], map: Record<string, string>) =>
    keys.map((k) => ({ value: k, label: map[k] ?? k }))

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
      fd.append('application_type', 'masters')
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
      <div className="rounded-brand border border-grey bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-navy">
          <span>
            {t.form.progress} {step + 1} {t.form.of} 4
          </span>
          <span className="text-muted">{t.masters.steps[step]}</span>
        </div>
        <div className="flex gap-2">
          {t.masters.steps.map((label, i) => (
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
        <Section title={t.masters.sec.study}>
          <Input label={t.masters.f.target_country} required value={String(v.target_country)} onChange={set('target_country')} error={errors.target_country} />
          <Input label={t.masters.f.target_program} required value={String(v.target_program)} onChange={set('target_program')} error={errors.target_program} />
          <Input label={t.masters.f.intake_term} value={String(v.intake_term)} onChange={set('intake_term')} placeholder={lang === 'ar' ? 'خريف ٢٠٢٧' : 'Fall 2027'} />
          <Select label={t.masters.f.study_mode} placeholder={t.form.select} options={opts(STUDY_MODE, t.masters.opt.study_mode)} value={String(v.study_mode)} onChange={set('study_mode')} />
          <Select label={t.masters.f.funding_source} placeholder={t.form.select} options={opts(FUNDING, t.masters.opt.funding)} value={String(v.funding_source)} onChange={set('funding_source')} />
          <Input label={t.masters.f.budget} type="number" min="0" step="1" dir="ltr" value={String(v.budget)} onChange={set('budget')} />
          <Wide>
            <Textarea label={t.masters.f.target_universities} rows={3} hint={t.form.optional} value={String(v.target_universities)} onChange={set('target_universities')} />
          </Wide>
        </Section>
      )}

      {step === 2 && (
        <>
          <Section title={t.masters.sec.academic}>
            <Select label={t.form.f.edu_level} placeholder={t.form.select} options={opts(EDU, t.form.opt.edu)} value={String(v.edu_level)} onChange={set('edu_level')} />
            <Input label={t.form.f.major} value={String(v.major)} onChange={set('major')} />
            <Input label={t.form.f.university} value={String(v.university)} onChange={set('university')} />
            <Input label={t.form.f.graduation_year} type="number" min="1950" max="2100" dir="ltr" value={String(v.graduation_year)} onChange={set('graduation_year')} />
            <Input label={t.form.f.gpa} dir="ltr" placeholder="3.5 / 4" value={String(v.gpa)} onChange={set('gpa')} />
            <Input label={t.form.f.years_experience} type="number" min="0" step="0.5" dir="ltr" value={String(v.years_experience)} onChange={set('years_experience')} />
            <Input label={t.form.f.current_employer} value={String(v.current_employer)} onChange={set('current_employer')} />
            <Input label={t.form.f.current_title} value={String(v.current_title)} onChange={set('current_title')} />
          </Section>

          <Section title={t.masters.sec.language}>
            <Select label={t.masters.f.english_test} placeholder={t.form.select} options={opts(ENGLISH_TEST, t.masters.opt.english_test)} value={String(v.english_test)} onChange={set('english_test')} />
            <Input label={t.masters.f.english_score} dir="ltr" value={String(v.english_score)} onChange={set('english_score')} />
            <Select label={t.form.f.english_level} placeholder={t.form.select} options={opts(LEVELS, t.form.opt.level)} value={String(v.english_level)} onChange={set('english_level')} />
            <Select label={t.form.f.arabic_level} placeholder={t.form.select} options={opts(LEVELS, t.form.opt.level)} value={String(v.arabic_level)} onChange={set('arabic_level')} />
            <Input label={t.masters.f.passport_number} dir="ltr" value={String(v.passport_number)} onChange={set('passport_number')} />
            <Input label={t.masters.f.passport_expiry} type="date" value={String(v.passport_expiry)} onChange={set('passport_expiry')} />
            <Wide>
              <Checkbox label={t.masters.f.previous_visa_refusal} checked={Boolean(v.previous_visa_refusal)} onChange={set('previous_visa_refusal')} />
            </Wide>
            {Boolean(v.previous_visa_refusal) && (
              <Wide>
                <Textarea label={t.masters.f.visa_refusal_details} rows={3} value={String(v.visa_refusal_details)} onChange={set('visa_refusal_details')} />
              </Wide>
            )}
          </Section>
        </>
      )}

      {step === 3 && (
        <Section title={t.masters.sec.docs}>
          <Wide>
            <CvUpload
              file={cv}
              label={t.masters.f.cv}
              onChange={(f, err) => {
                setCv(f)
                setErrors((p) => ({ ...p, cv: err ?? '' }))
              }}
              error={errors.cv}
            />
          </Wide>
          <Wide>
            <Textarea label={t.masters.f.notes} rows={5} value={String(v.cover_letter)} onChange={set('cover_letter')} />
          </Wide>
          <Wide>
            <div className="rounded-xl bg-navy-050 p-4">
              <Checkbox label={t.masters.f.consent} checked={Boolean(v.consent)} onChange={set('consent')} error={errors.consent} />
            </div>
          </Wide>
        </Section>
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
