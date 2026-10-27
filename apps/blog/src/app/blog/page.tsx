import { BASE_URL } from '@hyunwoo/shared/config'
import { formatDate } from '@hyunwoo/shared/lib'
import type { Post } from '@hyunwoo/shared/types'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedPosts } from '@/entities/post'
import { ApiError, InnerContainer } from '@/shared/ui'

export const metadata: Metadata = {
  title: '전체 글',
  description: 'hyunwoo.dev 에 발행된 모든 글을 연도별로 모았습니다.',
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
}

function groupByYear(posts: Post[]) {
  const groups = new Map<number, Post[]>()
  for (const post of posts) {
    const year = new Date(post.meta.date).getFullYear()
    groups.set(year, [...(groups.get(year) ?? []), post])
  }
  return [...groups.entries()].sort(([a], [b]) => b - a)
}

export default async function Page() {
  const posts = await getPublishedPosts()

  if (posts.length === 0) {
    return <ApiError message="포스트를 불러올 수 없습니다." />
  }

  const sorted = [...posts].sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime())

  return (
    <InnerContainer className="py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">전체 글</h1>
        <p className="mt-2 text-sm text-muted-foreground">총 {posts.length}개</p>

        {groupByYear(sorted).map(([year, items]) => (
          <section key={year} className="mt-10">
            <h2 className="text-lg font-semibold border-b pb-2">{year}</h2>
            <ul className="mt-2 divide-y">
              {items.map(post => (
                <li key={post.meta.slug}>
                  <Link
                    href={`/blog/${post.meta.slug}`}
                    className="group flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                  >
                    <span className="font-medium group-hover:text-primary transition-colors">{post.meta.title}</span>
                    <time dateTime={post.meta.date} className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(post.meta.date)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </InnerContainer>
  )
}
