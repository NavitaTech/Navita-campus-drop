import { currentUser } from '@/lib/auth-server'
import { listApplications } from '@/lib/queries'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const HEADERS = [
  'Reference',
  'Track',
  'Status',
  'Name (AR)',
  'Name (EN)',
  'Email',
  'Mobile',
  'Department',
  'Position / Programme',
  'Target country',
  'Years of experience',
  'Submitted at',
  'CV attached',
]

/** Excel only reads UTF-8 CSV correctly when it starts with a BOM. */
const BOM = '﻿'

function cell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  // A leading =, +, - or @ makes Excel treat the cell as a formula.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

export async function GET(req: Request) {
  if (!(await currentUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const p = new URL(req.url).searchParams
  const rows = (await listApplications(
    {
      q: p.get('q') ?? undefined,
      dep: p.get('dep') ?? undefined,
      status: p.get('status') ?? undefined,
      type: p.get('type') ?? undefined,
    },
    5000,
  )) as unknown as Array<Record<string, unknown> & {
    department: { name_en: string } | null
    position: { title_en: string } | null
  }>

  const lines = [
    HEADERS.map(cell).join(','),
    ...rows.map((r) =>
      [
        r.reference_code,
        r.application_type,
        r.status,
        r.full_name_ar,
        r.full_name_en,
        r.email,
        r.phone,
        r.department?.name_en ?? '',
        r.position?.title_en ?? r.position_other ?? r.target_program ?? '',
        r.target_country ?? '',
        r.years_experience ?? '',
        new Date(String(r.submitted_at)).toISOString().slice(0, 16).replace('T', ' '),
        r.cv_path ? 'yes' : 'no',
      ]
        .map(cell)
        .join(','),
    ),
  ]

  const stamp = new Date().toISOString().slice(0, 10)
  return new Response(BOM + lines.join('\r\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="navita-applications-${stamp}.csv"`,
    },
  })
}
