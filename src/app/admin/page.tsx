import { redirect } from 'next/navigation'
import { DashboardView, type Row } from '@/components/DashboardView'
import { getCatalog } from '@/lib/catalog'
import { getStats, listApplications } from '@/lib/queries'
import { currentUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dep?: string; status?: string; type?: string }>
}) {
  const user = await currentUser()
  if (!user) redirect('/admin/login')

  const filters = await searchParams
  const [rows, stats, { departments }] = await Promise.all([
    listApplications(filters),
    getStats(),
    getCatalog(),
  ])

  return (
    <DashboardView
      user={{ name: user.name }}
      rows={rows as unknown as Row[]}
      departments={departments}
      stats={stats}
    />
  )
}
