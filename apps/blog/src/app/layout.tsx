import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'
import { RSS_ALTERNATE_TYPES } from '@/shared/config'
import '@/styles/globals.css'
import { BASE_URL } from '@hyunwoo/shared/config'
import { ThemeProvider } from '@/providers/theme-provider'
import { PageviewTracker } from '@/shared/lib'
import { Footer, Header } from '@/widgets/header'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'hyunwoo.dev | 풀스택 개발 블로그',
    template: '%s | hyunwoo.dev',
  },
  description:
    '풀스택 개발자 현우의 기술 블로그입니다. React, Next.js, TypeScript 등 웹 개발 경험과 노하우를 공유합니다.',
  keywords: [
    '풀스택',
    'Full-Stack',
    '프론트엔드',
    'Frontend',
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
    '웹 개발',
    '개발 블로그',
    '기술 블로그',
  ],
  authors: [{ name: 'Hyunwoo Cha', url: BASE_URL }],
  creator: 'Hyunwoo Cha',
  publisher: 'Hyunwoo Cha',
  applicationName: 'hyunwoo.dev',
  category: 'technology',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    siteName: 'hyunwoo.dev',
    title: 'hyunwoo.dev | 풀스택 개발 블로그',
    description:
      '풀스택 개발자 현우의 기술 블로그입니다. React, Next.js, TypeScript 등 웹 개발 경험과 노하우를 공유합니다.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'hyunwoo.dev',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@chahyunwoo_dev',
    creator: '@chahyunwoo_dev',
    title: 'hyunwoo.dev | 풀스택 개발 블로그',
    description:
      '풀스택 개발자 현우의 기술 블로그입니다. React, Next.js, TypeScript 등 웹 개발 경험과 노하우를 공유합니다.',
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
    other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
      : undefined,
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'ko-KR': BASE_URL,
      'x-default': BASE_URL,
    },
    types: RSS_ALTERNATE_TYPES,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
      </head>
      <body className={`font-pretendard antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <NextTopLoader color="#3b82f6" height={2} showSpinner={false} shadow={false} />
          <PageviewTracker />
          <Header />
          <main className="flex-1 flex mt-14">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
