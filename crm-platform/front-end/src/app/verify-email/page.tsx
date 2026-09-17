import { Suspense } from 'react'

import { VerifyEmailContent } from './verify-email-content'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-8 text-center">
        <p className="text-lg font-semibold">Підтвердження email...</p>
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>
      </div>
    </div>
  )
}