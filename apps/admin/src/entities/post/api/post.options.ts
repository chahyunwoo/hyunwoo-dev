import type { ApiOkJson } from '@hyunwoo/shared/api'
import { ENDPOINTS } from '@hyunwoo/shared/api'
import { queryOptions } from '@tanstack/react-query'
import { adminApi } from '@/shared/api'
import { queryKeys } from '@/shared/config'
import { stripLeadingSlash } from '@/shared/lib'
import type { PostListParams } from '../model'

/**
 * 응답 타입을 손으로 선언하지 않고 api-server의 OpenAPI 스펙에서 생성한 타입을 쓴다.
 * 백엔드 DTO가 바뀌면 여기 타입이 바뀌고 참조부에서 타입 에러가 난다.
 *
 * 경로를 문자열로 다시 쓰지 않고 `typeof ENDPOINTS.blog.posts`로 묶는다 — 아래 queryFn이
 * 실제 요청에 쓰는 값과 같은 출처라야, 둘이 갈라질 때 컴파일이 잡아준다.
 */
type PostListResponse = ApiOkJson<typeof ENDPOINTS.blog.posts, 'get'>

/**
 * 동적 경로는 `ENDPOINTS.blog.postBySlug`가 함수라 `typeof`로 묶을 수 없다.
 * 스펙의 경로 템플릿을 그대로 쓴다 — 생성 타입의 키가 `{slug}` 형태이기 때문이다.
 */
type PostDetailResponse = ApiOkJson<'/api/blog/posts/{slug}', 'get'>

export function postListOptions(params?: PostListParams) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.category) searchParams.set('category', params.category)

  return queryOptions({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => adminApi.get(`${stripLeadingSlash(ENDPOINTS.blog.posts)}?${searchParams}`).json<PostListResponse>(),
  })
}

export function postDetailOptions(slug: string) {
  return queryOptions({
    queryKey: queryKeys.posts.detail(slug),
    queryFn: () => adminApi.get(stripLeadingSlash(ENDPOINTS.blog.postBySlug(slug))).json<PostDetailResponse>(),
    staleTime: 0,
  })
}
