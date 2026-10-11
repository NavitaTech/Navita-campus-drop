/** Option keys shared by the form, the dashboard filters and the CSV export. */

export const APPLICATION_TYPES = ['job', 'masters'] as const
export type ApplicationType = (typeof APPLICATION_TYPES)[number]

export const STUDY_MODE = ['on_campus', 'online', 'hybrid'] as const
export const FUNDING = ['self', 'scholarship', 'employer', 'loan', 'other'] as const
export const ENGLISH_TEST = ['ielts', 'toefl', 'duolingo', 'none', 'planned'] as const

export const GENDERS = ['male', 'female'] as const
export const MARITAL = ['single', 'married', 'divorced', 'widowed'] as const
export const EMPLOYMENT = ['full_time', 'part_time', 'contract', 'internship', 'remote'] as const
export const LEVELS = ['native', 'advanced', 'intermediate', 'beginner', 'none'] as const
export const EDU = ['high_school', 'diploma', 'bachelor', 'master', 'phd'] as const
export const HEARD = ['website', 'social', 'friend', 'linkedin', 'qr', 'other'] as const

export const STATUSES = [
  'new',
  'under_review',
  'shortlisted',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
] as const

export type Status = (typeof STATUSES)[number]

/** Tailwind classes per status chip, tuned to the Navita palette. */
export const STATUS_STYLE: Record<Status, string> = {
  new: 'bg-orange/10 text-orange ring-orange/25',
  under_review: 'bg-navy/10 text-navy ring-navy/20',
  shortlisted: 'bg-sky-50 text-sky-700 ring-sky-200',
  interview: 'bg-violet-50 text-violet-700 ring-violet-200',
  offer: 'bg-amber-50 text-amber-700 ring-amber-200',
  hired: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  withdrawn: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export const CV_MAX_BYTES = 5 * 1024 * 1024
export const CV_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
