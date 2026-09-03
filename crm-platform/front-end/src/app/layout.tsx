import { QueryProvider } from '@/lib/query-client'
import { AuthProvider } from '@/providers/auth-provider'
import { WorkspaceProvider } from '@/providers/workspace-provider'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <QueryProvider>
          <AuthProvider>
            <WorkspaceProvider>{children}</WorkspaceProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}