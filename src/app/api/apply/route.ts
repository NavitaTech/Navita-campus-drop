import { NextResponse } from 'next/server'
import { CV_BUCKET, db, storage } from '@/lib/supabase'
import {
  APPLICATION_TYPES, CV_MAX_BYTES, CV_MIME, EDU, EMPLOYMENT, ENGLISH_TEST, FUNDING,
  GENDERS, HEARD, LEVELS, MARITAL, STUDY_MODE,
} from '@/lib/options'

export const runtime = 'nodejs'

const text = (fd: FormData, k: string) => {
  const raw = fd.get(k)
  const s = typeof raw === 'string' ? raw.trim() : ''
  return s === '' ? null : s
}

const num = (fd: FormData, k: string) => {
  const s = text(fd, k)
  if (s === null) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

const int = (fd: FormData, k: string) => {
  const n = num(fd, k)
  return n === null ? null : Math.trunc(n)
}

const bool = (fd: FormData, k: string) => fd.get(k) === 'true'

/** Only let through values the CHECK constraints accept. */
const oneOf = (fd: FormData, k: string, allowed: readonly string[]) => {
  const s = text(fd, k)
  return s && allowed.includes(s) ? s : null
}

/** Storage keys must be ASCII-safe; Arabic filenames are kept in cv_filename. */
function safeName(name: string) {
  const ext = (name.match(/\.[a-z0-9]+$/i)?.[0] ?? '').toLowerCase()
  const stem = name
    .slice(0, name.length - ext.length)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${stem || 'cv'}${ext}`
}

export async function POST(req: Request) {
  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 })
  }

  // ── Validate ──────────────────────────────────────────────────────────
  const full_name_ar = text(fd, 'full_name_ar')
  const full_name_en = text(fd, 'full_name_en')
  const phone = text(fd, 'phone')
  const email = text(fd, 'email')
  const department_id = int(fd, 'department_id')
  const consent = bool(fd, 'consent')

  const rawType = text(fd, 'application_type')
  const application_type =
    rawType && (APPLICATION_TYPES as readonly string[]).includes(rawType) ? rawType : 'job'
  const isMasters = application_type === 'masters'

  if (!full_name_ar || !full_name_en || !phone || !email) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  // A department is only meaningful on the job track; the Master's track needs
  // a destination and a programme instead.
  if (!isMasters && !department_id) {
    return NextResponse.json({ error: 'Department is required.' }, { status: 400 })
  }
  if (isMasters && (!text(fd, 'target_country') || !text(fd, 'target_program'))) {
    return NextResponse.json(
      { error: 'Target country and programme are required.' },
      { status: 400 },
    )
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }
  if (!consent) {
    return NextResponse.json({ error: 'Consent is required.' }, { status: 400 })
  }

  const cv = fd.get('cv')
  if (!(cv instanceof File) || cv.size === 0) {
    return NextResponse.json({ error: 'A CV file is required.' }, { status: 400 })
  }
  if (!CV_MIME.includes(cv.type)) {
    return NextResponse.json({ error: 'Unsupported CV file type.' }, { status: 415 })
  }
  if (cv.size > CV_MAX_BYTES) {
    return NextResponse.json({ error: 'CV file is larger than 5 MB.' }, { status: 413 })
  }

  const sb = db()

  // ── Reference code ────────────────────────────────────────────────────
  const { data: ref, error: refErr } = await sb.rpc('next_reference_code', { p_type: application_type })
  if (refErr || !ref) {
    console.error('reference_code failed', refErr)
    return NextResponse.json({ error: 'Could not allocate a reference number.' }, { status: 500 })
  }
  const reference_code = String(ref)

  // ── Upload the CV first, so a failed upload never leaves an orphan row ─
  const year = new Date().getFullYear()
  const cv_path = `${year}/${reference_code}-${safeName(cv.name)}`

  const { error: upErr } = await storage()
    .from(CV_BUCKET)
    .upload(cv_path, cv, { contentType: cv.type, upsert: false })

  if (upErr) {
    console.error('cv upload failed', upErr)
    return NextResponse.json({ error: 'Could not upload the CV file.' }, { status: 500 })
  }

  // ── Insert ────────────────────────────────────────────────────────────
  const row = {
    reference_code,
    application_type,
    locale: text(fd, 'locale') === 'en' ? 'en' : 'ar',

    full_name_ar,
    full_name_en,
    national_id: text(fd, 'national_id'),
    nationality: text(fd, 'nationality'),
    gender: oneOf(fd, 'gender', GENDERS),
    date_of_birth: text(fd, 'date_of_birth'),
    marital_status: oneOf(fd, 'marital_status', MARITAL),
    country: text(fd, 'country'),
    city: text(fd, 'city'),
    address: text(fd, 'address'),
    phone,
    whatsapp: text(fd, 'whatsapp'),
    email,

    department_id: isMasters ? null : department_id,
    position_id: isMasters ? null : int(fd, 'position_id'),
    position_other: text(fd, 'position_other'),
    employment_type: oneOf(fd, 'employment_type', EMPLOYMENT),
    expected_salary: num(fd, 'expected_salary'),
    available_from: text(fd, 'available_from'),
    heard_about_us: oneOf(fd, 'heard_about_us', HEARD),

    edu_level: oneOf(fd, 'edu_level', EDU),
    major: text(fd, 'major'),
    university: text(fd, 'university'),
    graduation_year: int(fd, 'graduation_year'),
    gpa: text(fd, 'gpa'),

    years_experience: num(fd, 'years_experience'),
    current_employer: text(fd, 'current_employer'),
    current_title: text(fd, 'current_title'),
    current_salary: num(fd, 'current_salary'),
    notice_period: text(fd, 'notice_period'),

    arabic_level: oneOf(fd, 'arabic_level', LEVELS),
    english_level: oneOf(fd, 'english_level', LEVELS),
    computer_skills: text(fd, 'computer_skills'),
    certifications: text(fd, 'certifications'),
    driving_license: bool(fd, 'driving_license'),
    willing_relocate: bool(fd, 'willing_relocate'),
    residency_status: text(fd, 'residency_status'),

    cover_letter: text(fd, 'cover_letter'),

    // Masters track
    target_country: text(fd, 'target_country'),
    target_universities: text(fd, 'target_universities'),
    target_program: text(fd, 'target_program'),
    intake_term: text(fd, 'intake_term'),
    study_mode: oneOf(fd, 'study_mode', STUDY_MODE),
    funding_source: oneOf(fd, 'funding_source', FUNDING),
    budget: num(fd, 'budget'),
    english_test: oneOf(fd, 'english_test', ENGLISH_TEST),
    english_score: text(fd, 'english_score'),
    passport_number: text(fd, 'passport_number'),
    passport_expiry: text(fd, 'passport_expiry'),
    previous_visa_refusal: bool(fd, 'previous_visa_refusal'),
    visa_refusal_details: text(fd, 'visa_refusal_details'),

    cv_path,
    cv_filename: cv.name,
    cv_size: cv.size,
    cv_mime: cv.type,

    consent: true,
  }

  const { error: insErr } = await sb.from('application').insert(row)

  if (insErr) {
    console.error('application insert failed', insErr)
    // Don't keep a file with no application attached to it.
    await storage().from(CV_BUCKET).remove([cv_path])
    return NextResponse.json({ error: 'Could not save the application.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, reference_code })
}
