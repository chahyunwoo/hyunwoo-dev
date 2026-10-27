import { BASE_URL } from '@hyunwoo/shared/config'
import type { Params } from '@hyunwoo/shared/types'
import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getPostBySlug,
  getPublishedPosts,
  MobileTOC,
  PostBody,
  PostFooter,
  PostHead,
  PostTOC,
  ReadingProgress,
} from '@/entities/post'
import { InnerContainer } from '@/shared/ui'

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map(post => ({
    slug: post.meta.slug,
  }))
}

export async function generateMetadata({ params }: Params<{ slug: string }>): Promise<Metadata> {
  const slug = (await params).slug
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
    }
  }

  const { title, description, thumbnail, tags, date } = post.meta
  const url = `${BASE_URL}/blog/${slug}`

  return {
    title,
    description,
    keywords: tags,
    authors: [{ name: 'Hyunwoo Cha', url: BASE_URL }],
    openGraph: {
      type: 'article',
      locale: 'ko_KR',
      url,
      title,
      description,
      siteName: 'hyunwoo.dev',
      publishedTime: date,
      authors: ['Hyunwoo Cha'],
      tags,
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [thumbnail],
    },
    alternates: {
      canonical: url,
      languages: {
        'ko-KR': url,
        'x-default': url,
      },
    },
  }
}

export default async function Page({ params }: Params<{ slug: string }>) {
  const slug = (await params).slug
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.meta.title,
      description: post.meta.description,
      image: post.meta.thumbnail,
      datePublished: post.meta.date,
      dateModified: post.meta.updatedAt || post.meta.date,
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
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/blog/${slug}`,
      },
      keywords: post.meta.tags.join(', '),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: BASE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: post.meta.mainTag,
          item: `${BASE_URL}/?category=${post.meta.mainTag}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.meta.title,
        },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />
      <InnerContainer className="py-4 md:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 md:hidden not-prose"
        >
          <ChevronLeft className="h-4 w-4" />
          목록으로
        </Link>
        <div className="flex justify-center gap-10">
          <article className="prose dark:prose-invert tracking-wide leading-relaxed max-w-4xl w-full min-w-0">
            <PostHead post={post} />
            <MobileTOC />
            <PostBody post={post} />
            <PostFooter post={post} slug={slug} />
          </article>
          <aside className="hidden xl:block w-48 shrink-0">
            <div className="sticky top-20">
              <PostTOC />
            </div>
          </aside>
        </div>
      </InnerContainer>
    </>
  )
}
