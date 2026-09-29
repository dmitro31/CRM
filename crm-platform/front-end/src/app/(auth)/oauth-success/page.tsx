import { Suspense } from 'react'

import { OAuthSuccessContent } from './oauth-success-content'

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<OAuthSuccessLoading />}>
      <OAuthSuccessContent />
    </Suspense>
  )
}

function OAuthSuccessLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">Завантаження...</p>
    </div>
  )
}