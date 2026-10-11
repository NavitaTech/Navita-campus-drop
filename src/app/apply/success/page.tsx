import { Suspense } from 'react'
import { SuccessView } from '@/components/SuccessView'

export default function Page() {
  return (
    <Suspense>
      <SuccessView />
    </Suspense>
  )
}
