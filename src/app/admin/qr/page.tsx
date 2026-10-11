import { redirect } from 'next/navigation'
import { QrView } from '@/components/QrView'
import { currentUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const user = await currentUser()
  if (!user) redirect('/admin/login')

  // The code itself is drawn in the browser, so `qrcode` never reaches the
  // server bundle. Falls back to the page's own origin when the env var is
  // unset, which keeps previews and local dev working.
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return <QrView user={{ name: user.name }} baseUrl={base} />
}
