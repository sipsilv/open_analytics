import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Open Analytics',
  description: 'Analytics Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Force dark theme by default - always apply dark class
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                  // Store preference but always start with dark
                  const stored = localStorage.getItem('theme');
                  if (stored === 'light') {
                    // Only switch to light if explicitly set, but default is dark
                    setTimeout(() => {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                    }, 0);
                  }
                } catch (e) {
                  // Always default to dark on error
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`dark ${inter.className}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
