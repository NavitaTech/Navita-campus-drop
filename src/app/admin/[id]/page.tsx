import { notFound, redirect } from 'next/navigation'
import { DetailView } from '@/components/DetailView'
import { db } from '@/lib/supabase'
import { currentUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) redirect('/admin/login')

  const { id } = await params
  const sb = db()

  const { data: app } = await sb
    .from('application')
    .select('*, department:department_id ( name_ar, name_en ), position:position_id ( title_ar, title_en )')
    .eq('id', id)
    .maybeSingle()

  if (!app) notFound()

  const { data: notes } = await sb
    .from('application_note')
    .select('*, admin_user:admin_user_id ( full_name )')
    .eq('application_id', id)
    .order('created_at', { ascending: false })

  const withAuthor = (notes ?? []).map((n) => {
    const { admin_user, ...rest } = n as typeof n & { admin_user: { full_name: string } | null }
    return { ...rest, author: admin_user?.full_name ?? null }
  })

  return (
    <DetailView
      user={{ name: user.name }}
      app={app as never}
      notes={withAuthor as never}
      canEdit={user.role !== 'viewer'}
    />
  )
}
