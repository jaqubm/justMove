import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'justMove',
  description: 'Track your daily movement. Build streaks. Level up.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
