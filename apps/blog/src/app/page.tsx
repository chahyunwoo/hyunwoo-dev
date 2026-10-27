import { BASE_URL } from '@hyunwoo/shared/config'
import type { BlogParams } from '@hyunwoo/shared/types'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PostListContainer } from '@/entities/post'
import { PostSkeleton } from '@/shared/ui'
import { BlogLayout } from '@/widgets/sidebar'

export async function generateMetadata({ searchParams }: { searchParams: BlogParams }): Promise<Metadata> {
  const { category, tag, parentCategory, page } = await searchParams

  let title = 'hyunwoo.dev'
  let description = '최신 기술 관련 글과 경험을 공유합니다.'
  let keywords = '개발, 프로그래밍, 기술, 블로그, 웹개발'

  if (category) {
    title = `hyunwoo.dev | ${category}`
    description = `${category} 카테고리의 모든 포스트입니다.`
    keywords = `${category}, 개발, 프로그래밍, 기술, 블로그, 웹개발`
  } else if (tag && parentCategory) {
    title = `hyunwoo.dev | ${parentCategory} > ${tag}`
    description = `${parentCategory} 카테고리의 ${tag} 태그 포스트입니다.`
    keywords = `${parentCategory}, ${tag}, 개발, 프로그래밍, 기술, 블로그, 웹개발`
  }

  // 2페이지 이후 canonical 을 1페이지로 접으면 그 페이지에만 링크된 글이 크롤 경로를 잃는다.
  const canonicalParams = new URLSearchParams()
  if (category) {
    canonicalParams.set('category', category)
  } else if (tag && parentCategory) {
    canonicalParams.set('category', parentCategory)
    canonicalParams.set('tag', tag)
  }
  const pageNumber = Number(page)
  if (Number.isInteger(pageNumber) && pageNumber > 1) canonicalParams.set('page', String(pageNumber))
  const canonicalQuery = canonicalParams.toString()
  const canonicalUrl = canonicalQuery ? `${BASE_URL}/?${canonicalQuery}` : BASE_URL

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: `${BASE_URL}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'hyunwoo.dev',
        },
      ],
    },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'hyunwoo.dev',
  url: BASE_URL,
  description:
    '풀스택 개발자 현우의 기술 블로그입니다. React, Next.js, TypeScript 등 웹 개발 경험과 노하우를 공유합니다.',
  author: {
    '@type': 'Person',
    name: 'Hyunwoo Cha',
    url: BASE_URL,
  },
  publisher: {
    '@type': 'Person',
    name: 'Hyunwoo Cha',
    url: BASE_URL,
  },
}

export default async function Home({ searchParams }: { searchParams: BlogParams }) {
  const { category, tag, parentCategory, page } = await searchParams

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogLayout>
        <Suspense fallback={<PostSkeleton />}>
          <PostListContainer
            category={category}
            tag={tag}
            parentCategory={parentCategory}
            page={page ? Number(page) : 1}
          />
        </Suspense>
      </BlogLayout>
    </>
  )
}
