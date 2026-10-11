import type { ApplicationType, Status } from './options'

export type Department = {
  id: number
  code: string
  name_ar: string
  name_en: string
  sort_order: number
  is_active: boolean
}

export type Position = {
  id: number
  department_id: number
  title_ar: string
  title_en: string
  employment_type: string
  is_open: boolean
  sort_order: number
}

export type Application = {
  id: string
  reference_code: string
  application_type: ApplicationType
  status: Status
  locale: 'ar' | 'en'

  full_name_ar: string
  full_name_en: string
  national_id: string | null
  nationality: string | null
  gender: string | null
  date_of_birth: string | null
  marital_status: string | null
  country: string | null
  city: string | null
  address: string | null
  phone: string
  whatsapp: string | null
  email: string

  department_id: number | null
  position_id: number | null
  position_other: string | null
  employment_type: string | null
  expected_salary: number | null
  available_from: string | null
  heard_about_us: string | null

  edu_level: string | null
  major: string | null
  university: string | null
  graduation_year: number | null
  gpa: string | null

  years_experience: number | null
  current_employer: string | null
  current_title: string | null
  current_salary: number | null
  notice_period: string | null

  arabic_level: string | null
  english_level: string | null
  computer_skills: string | null
  certifications: string | null
  driving_license: boolean
  willing_relocate: boolean
  residency_status: string | null

  cover_letter: string | null

  // Masters track only
  target_country: string | null
  target_universities: string | null
  target_program: string | null
  intake_term: string | null
  study_mode: string | null
  funding_source: string | null
  budget: number | null
  english_test: string | null
  english_score: string | null
  passport_number: string | null
  passport_expiry: string | null
  previous_visa_refusal: boolean
  visa_refusal_details: string | null

  cv_path: string | null
  cv_filename: string | null
  cv_size: number | null
  cv_mime: string | null

  consent: boolean
  submitted_at: string
  updated_at: string
}

export type ApplicationNote = {
  id: number
  application_id: string
  admin_user_id: string | null
  note: string | null
  old_status: string | null
  new_status: string | null
  created_at: string
}
