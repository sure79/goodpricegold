import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function LoginFormWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

export default function LoginPage() {
  return <LoginFormWrapper />
}