import { Suspense } from 'react'
import { LoginView } from '@/components/LoginView'

export default function Page() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  )
}
