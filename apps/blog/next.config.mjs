/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ['@hyunwoo/shared', '@hyunwoo/mdx'],
  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.chahyunwoo.dev',
      },
    ],
  },
  reactCompiler: true,
  headers: async () => [
    // sitemap.xml / robots.txt 는 크롤러가 색인 갱신의 기준으로 삼는 파일이라
    // 아래 일반 규칙(s-maxage=86400)에 걸리면 on-demand revalidate 로 새로 만들어도
    // CDN 이 최대 24시간 묵은 응답을 계속 내보낸다. 더 짧게 잡고 재검증하게 한다.
    // 순서 주의: Next 는 먼저 매치된 규칙을 쓰므로 반드시 '/(.*)' 보다 위에 있어야 한다.
    {
      source: '/:path(sitemap.xml|robots.txt)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
        },
      ],
    },
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
        },
      ],
    },
  ],
}

export default nextConfig
