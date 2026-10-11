import { redirect } from 'next/navigation'

/** The choice now lives on the landing page; this keeps older QR codes working. */
export default function Page() {
  redirect('/')
}
