import { BASE_URL } from '@hyunwoo/shared/config'
import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/entities/post'

const ABOUT_LAST_MODIFIED = '2025-03-27T00:00:00.000Z'

/**
 * sitemap 을 **동적 라우트로 강제**한다.
 *
 * 기본값(정적 생성)에서는 Vercel 이 이 라우트를 `compute: "static"` 인
 * route handler 로 취급해 CDN 에 `s-maxage=86400` 으로 얹는다. 그러면
 * on-demand revalidate 가 Next 캐시를 지워도 **CDN 이 최대 24시간 옛 응답을
 * 계속 서빙**해서 새 글이 sitemap 에 안 뜬다(실측 2026-09-04).
 *
 * 같은 revalidate 호출에서 홈(`/`)은 `x-vercel-cache: MISS` 로 갱신되는데
 * `/sitemap.xml` 만 `HIT`(age 1509)로 남는 것을 확인했다. 차이는 이 라우트가
 * prerender-manifest 에 `compute: static` 으로 올라간다는 점이었다.
 *
 * 동적으로 두면 매 요청이 API 를 타지만, sitemap 은 크롤러만 부르는
 * 저빈도 경로라 비용보다 색인 지연을 없애는 편이 낫다.
 */
export const dynamic = 'force-dynamic'

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
  //
  // ⚠️ 이 라우트는 `force-dynamic` 이라 **요청마다** 실행된다. 예전처럼 여기서
  // throw 하면 빌드가 아니라 **런타임 500**이 된다. 크롤러에게 500은 빈 sitemap
  // 보다 나쁜 신호이므로 던지지 않는다.
  //
  // 대신 정적 페이지만이라도 내보낸다. 글이 빠진 sitemap은 그 자체로 손해지만,
  // 색인된 글 URL은 이미 알려져 있어 즉시 사라지지 않는다. 로그로 흔적을 남겨
  // 장애를 눈에 띄게 하는 편이 낫다(`apiFetch`도 [apiFetch] 로그를 남긴다).
  if (posts.length === 0) {
    console.error(
      '[sitemap] 발행 글이 0개다. API 응답을 받지 못했을 가능성이 높다. ' +
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
