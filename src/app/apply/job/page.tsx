import { ApplyView } from '@/components/ApplyView'
import { getCatalog } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { departments, positions } = await getCatalog()
  return <ApplyView departments={departments} positions={positions} />
}
