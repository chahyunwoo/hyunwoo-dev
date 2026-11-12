import { BASE_URL } from '@hyunwoo/shared/config'
import { buildRssFeed, getPublishedPosts } from '@/entities/post'

// sitemap 과 같은 이유 — 정적이면 Vercel CDN 이 옛 피드를 최대 24시간 서빙한다.
export const dynamic = 'force-dynamic'

export async function GET() {
  const posts = await getPublishedPosts()
  if (posts.length === 0) {
    console.error('[rss] 발행 글이 0개다. API 응답을 받지 못했을 가능성이 높다.')
  }

  return new Response(buildRssFeed(posts, BASE_URL), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
