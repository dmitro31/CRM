// layout.tsx
import { Inter } from 'next/font/google' // [1] Імпортуємо Inter
import { QueryProvider } from '@/lib/query-client'
import { AuthProvider } from '@/providers/auth-provider'
import { WorkspaceProvider } from '@/providers/workspace-provider'
import './globals.css'
import HeaderWidgets from '@/widgets/Header/Header-widgets'

// [2] Налаштовуємо шрифт
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter', 
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={inter.variable}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <HeaderWidgets />
              {children}
            </WorkspaceProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
