import { HomeView } from '@/components/HomeView'
import { getCatalog } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { departments, positions } = await getCatalog()
  return <HomeView departments={departments} positions={positions} />
}
