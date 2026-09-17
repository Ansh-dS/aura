// used when '<head>' or layout file doesnt' exist.
export const layoutHtml = (
  defaultTheme: string
) => `import type { ReactNode } from 'react'
import Providers from '@/src/components/core/providers'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* FIX: THE NO-BLINK SCRIPT
          vanilla JS runs synchronously before React even boots up.
            a. It reads the values of theme and mode from local storage.
            b. Them sets the correct HTML attributes instantly.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: \`
              try {
                var theme = localStorage.getItem('data-theme-name') || '${defaultTheme}';
                var mode = localStorage.getItem('data-mode') || 'light';
                document.documentElement.setAttribute('data-theme-name', theme);
                document.documentElement.setAttribute('data-mode', mode);
              } catch (e) {}
            \`,
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
`

// use when you have '<head>'.
export const nextInjectionScript = (defaultTheme: string) => `
        {/* FIX: THE NO-BLINK SCRIPT */}
        <script
          dangerouslySetInnerHTML={{
            __html: \`
              try {
                var theme = localStorage.getItem('data-theme-name') || '${defaultTheme}';
                var mode = localStorage.getItem('data-mode') || 'light';
                document.documentElement.setAttribute('data-theme-name', theme);
                document.documentElement.setAttribute('data-mode', mode);
              } catch (e) {}
            \`,
          }}
        />`

export const providersTemplate = (
  isNext: boolean, // Kept to maintain interface contract
  defaultTheme: string
) => `'use client'

import React from 'react'
import { ThemeProvider } from './theme-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="${defaultTheme}" defaultMode="light">
      {/* <ToastProvider> can be added here later */}
      {children}
    </ThemeProvider>
  )
}`
