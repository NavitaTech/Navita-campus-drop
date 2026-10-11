import type { Metadata } from 'next'
import { Cairo, Inter, Poppins } from 'next/font/google'
import { LangProvider } from '@/components/LangProvider'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-cairo-var',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter-var',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins-var',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'التوظيف في نافيتا | Careers at Navita',
  description:
    'قدّم طلب توظيف في نافيتا — وجّه مستقبلك. Apply for a job at Navita — Navigate Your Future.',
  icons: { icon: '/navita-logo.jpg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${inter.variable} ${poppins.variable} antialiased`}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  )
}
