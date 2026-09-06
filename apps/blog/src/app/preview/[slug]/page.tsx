import { apiFetch } from '@hyunwoo/shared/api'
import type { Params } from '@hyunwoo/shared/types'
import { notFound } from 'next/navigation'
import { PostBody } from '@/entities/post'
import { InnerContainer } from '@/shared/ui'

interface PreviewPost {
  slug: string
  title: string
  description: string
  content: string
  category: string
  tags: { id: number; name: string }[]
  thumbnailUrl: string | null
  published: boolean
  publishedAt: string | null
  readingTime: number
  updatedAt: string
  createdAt: string
}

export default async function PreviewSlugPage({
  params,
  searchParams,
}: Params<{ slug: string }> & { searchParams: Promise<{ token?: string }> }) {
  const { slug } = await params
  const { token } = await searchParams

  if (!token) notFound()

  // 캐시를 쓰지 않는다. `DEFAULT_REVALIDATE = false` 는 Next 에서 "캐시 안 함"이
  // 아니라 **영구 캐시**라, 이 응답이 한 번 캐시되면 굳는다.
  //
  // 미리보기는 토큰마다 결과가 달라야 하는 요청이다. 누군가 토큰 없이(또는 만료된
  // 토큰으로) 이 URL 을 먼저 열면 notFound() 가 캐시되고, 그 뒤 유효한 토큰으로
  // 열어도 캐시된 Not Found 가 나간다 — 상태 코드는 200 인데 본문만 에러다.
  //
  // 검증하다 만든 상황이 아니라 정상 운영에서 재현된다: 디스코드 봇이 승인 링크를
  // 게시하면 **임베드 크롤러가 사람보다 먼저** 토큰 없이 URL 을 가져간다.
  const post = await apiFetch<PreviewPost>(`/api/blog/posts/${slug}/preview?token=${token}`, {
    revalidate: 0,
  })

  if (!post) notFound()

  return (
    <InnerContainer className="py-4 md:py-8">
      <div className="flex justify-center gap-10">
        <article className="prose dark:prose-invert tracking-wide leading-relaxed max-w-4xl w-full min-w-0">
          <div className="mb-8 pb-6 border-b border-border">
            <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded font-medium">
              미리보기
            </span>
            <h1 className="text-3xl font-bold mt-4 mb-2">{post.title}</h1>
            {post.description && <p className="text-muted-foreground mt-0">{post.description}</p>}
          </div>
          <PostBody
            post={{
              meta: {
                title: post.title,
                description: post.description,
                date: post.publishedAt ?? post.createdAt,
                tags: post.tags.map(t => t.name),
                mainTag: post.category,
                thumbnail: post.thumbnailUrl ?? '',
                published: post.published,
                slug: post.slug,
                readingTime: post.readingTime,
                updatedAt: post.updatedAt,
              },
              content: post.content,
            }}
          />
        </article>
      </div>
    </InnerContainer>
  )
}
