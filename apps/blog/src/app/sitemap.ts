import { BASE_URL } from '@hyunwoo/shared/config'
import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/entities/post'

const ABOUT_LAST_MODIFIED = '2025-03-27T00:00:00.000Z'

// 카테고리/태그는 `/?category=...&tag=...` 형태의 쿼리스트링 URL이라 sitemap에 넣지 않는다.
// 실측(2026-09-04): 라이브 sitemap 152개 중 106개(70%)가 이 조합이었고,
// 전부 같은 홈 문서의 변형이라 Google이 대표 URL로 접는다. 실제 글 URL의
// 크롤 예산만 잠식하므로 제외한다. (재현: curl -s https://chahyunwoo.dev/sitemap.xml |
//  grep -o '<loc>[^<]*</loc>' | grep -c '?category=')
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts()

  // 빌드 타임에 API가 죽어 있으면 `apiFetch`가 모든 실패를 null로 삼키고
  // `getPublishedPosts()`가 빈 배열을 돌려주므로, **빌드는 성공하면서**
  // 글이 하나도 없는 sitemap이 배포된다. 그 상태가 크롤러에게 노출되면
  // 색인에서 대량으로 빠지고, 아무 에러도 남지 않아 알아채기까지 오래 걸린다.
  // 발행 글은 항상 1개 이상이므로 0개는 정상 상태가 아니라 장애로 간주한다.
  if (posts.length === 0) {
    throw new Error(
      '[sitemap] 발행 글이 0개다. 빌드 타임에 API 응답을 받지 못했을 가능성이 높다. ' +
        '빈 sitemap 배포를 막기 위해 빌드를 실패시킨다. ' +
        'API 상태를 확인하라: curl -s -o /dev/null -w "%{http_code}" $NEXT_PUBLIC_API_URL/health',
    )
  }

  const blogPosts: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${BASE_URL}/blog/${post.meta.slug}`,
    lastModified: new Date(post.meta.date).toISOString(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about/ko`,
      lastModified: ABOUT_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about/en`,
      lastModified: ABOUT_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about/jp`,
      lastModified: ABOUT_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  return [...staticPages, ...blogPosts]
}
