import type { Metadata } from 'next'
import { PageviewTracker } from '@/shared/lib'
import { LoadingScreen, ScrollBackground, StarsBackground } from '@/shared/ui'
import './globals.css'

const PORTFOLIO_URL = 'https://portfolio.chahyunwoo.dev'
const DESCRIPTION =
  'Full-Stack Developer Cha Hyunwoo - Interactive portfolio showcasing projects, skills, and career experience.'

export const metadata: Metadata = {
  metadataBase: new URL(PORTFOLIO_URL),
  title: {
    default: 'Portfolio | Cha Hyunwoo',
    template: '%s | Cha Hyunwoo',
  },
  description: DESCRIPTION,
  keywords: ['Full-Stack Developer', 'Portfolio', 'React', 'Next.js', 'TypeScript', 'Three.js', 'Cha Hyunwoo'],
  authors: [{ name: 'Cha Hyunwoo', url: PORTFOLIO_URL }],
  creator: 'Cha Hyunwoo',
  publisher: 'Cha Hyunwoo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: PORTFOLIO_URL,
    siteName: 'portfolio.chahyunwoo.dev',
    title: 'Portfolio | Cha Hyunwoo',
    description: DESCRIPTION,
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cha Hyunwoo Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@chahyunwoo_dev',
    title: 'Portfolio | Cha Hyunwoo',
    description: DESCRIPTION,
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: PORTFOLIO_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-pretendard antialiased text-foreground overflow-x-hidden">
        <script
          dangerouslySetInnerHTML={{
            __html:
              'window.history.scrollRestoration="manual";window.scrollTo(0,0);document.documentElement.style.overflow="hidden";document.documentElement.style.touchAction="none";',
          }}
        />
        <PageviewTracker />
        <LoadingScreen />
        <StarsBackground />
        <ScrollBackground>{children}</ScrollBackground>
      </body>
    </html>
  )
}
