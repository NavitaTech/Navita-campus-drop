import { NextResponse } from 'next/server'
import { CV_BUCKET, db, storage } from '@/lib/supabase'
import { currentUser } from '@/lib/auth-server'

export const runtime = 'nodejs'

/** Hands the HR user a short-lived signed URL for a CV in the private bucket. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await currentUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const { data } = await db()
    .from('application')
    .select('cv_path, cv_filename')
    .eq('id', id)
    .maybeSingle()

  if (!data?.cv_path) {
    return NextResponse.json({ error: 'No CV on this application.' }, { status: 404 })
  }

  const { data: signed, error } = await storage()
    .from(CV_BUCKET)
    .createSignedUrl(data.cv_path, 60, { download: data.cv_filename ?? true })

  if (error || !signed) {
    console.error('signed url failed', error)
    return NextResponse.json({ error: 'Could not sign the file URL.' }, { status: 500 })
  }

  return NextResponse.redirect(signed.signedUrl)
}
