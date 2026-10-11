'use client'

import { Input, Section, Select, Wide } from './Field'
import { useLang } from './LangProvider'
import { GENDERS, MARITAL } from '@/lib/options'

export type Values = Record<string, string | boolean>
export type SetField = (
  k: string,
) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void

export const PERSONAL_DEFAULTS: Values = {
  full_name_ar: '', full_name_en: '', national_id: '', nationality: '', gender: '',
  date_of_birth: '', marital_status: '', country: '', city: '', address: '',
  phone: '', whatsapp: '', email: '',
}

export const PERSONAL_REQUIRED = ['full_name_ar', 'full_name_en', 'phone', 'email']

/** The identity block, shared by the job and the Master's application. */
export function PersonalStep({
  v,
  set,
  errors,
}: {
  v: Values
  set: SetField
  errors: Record<string, string>
}) {
  const { t } = useLang()
  const opts = (keys: readonly string[], map: Record<string, string>) =>
    keys.map((k) => ({ value: k, label: map[k] ?? k }))

  return (
    <Section title={t.form.sec.personal}>
      <Input label={t.form.f.full_name_ar} required dir="rtl" value={String(v.full_name_ar)} onChange={set('full_name_ar')} error={errors.full_name_ar} />
      <Input label={t.form.f.full_name_en} required dir="ltr" value={String(v.full_name_en)} onChange={set('full_name_en')} error={errors.full_name_en} />
      <Input label={t.form.f.national_id} inputMode="numeric" value={String(v.national_id)} onChange={set('national_id')} />
      <Input label={t.form.f.nationality} value={String(v.nationality)} onChange={set('nationality')} />
      <Select label={t.form.f.gender} placeholder={t.form.select} options={opts(GENDERS, t.form.opt.gender)} value={String(v.gender)} onChange={set('gender')} />
      <Input label={t.form.f.date_of_birth} type="date" value={String(v.date_of_birth)} onChange={set('date_of_birth')} />
      <Select label={t.form.f.marital_status} placeholder={t.form.select} options={opts(MARITAL, t.form.opt.marital)} value={String(v.marital_status)} onChange={set('marital_status')} />
      <Input label={t.form.f.country} value={String(v.country)} onChange={set('country')} />
      <Input label={t.form.f.city} value={String(v.city)} onChange={set('city')} />
      <Input label={t.form.f.phone} required type="tel" dir="ltr" placeholder="+965 0000 0000" value={String(v.phone)} onChange={set('phone')} error={errors.phone} />
      <Input label={t.form.f.whatsapp} type="tel" dir="ltr" placeholder="+965 0000 0000" value={String(v.whatsapp)} onChange={set('whatsapp')} />
      <Input label={t.form.f.email} required type="email" dir="ltr" value={String(v.email)} onChange={set('email')} error={errors.email} />
      <Wide>
        <Input label={t.form.f.address} value={String(v.address)} onChange={set('address')} />
      </Wide>
    </Section>
  )
}
