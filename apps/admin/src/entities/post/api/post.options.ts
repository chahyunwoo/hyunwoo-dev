import type { ApiJson } from '@hyunwoo/shared/api'
import { ENDPOINTS } from '@hyunwoo/shared/api'
import { queryOptions } from '@tanstack/react-query'
import { adminApi } from '@/shared/api'
import { queryKeys } from '@/shared/config'
import { stripLeadingSlash } from '@/shared/lib'
import type { Post, PostListParams } from '../model'

/**
 * 응답 타입을 손으로 선언하지 않고 api-server의 OpenAPI 스펙에서 생성한 타입을 쓴다.
 * 백엔드 DTO가 바뀌면 여기 타입이 바뀌고 참조부에서 타입 에러가 난다.
 */
type PostListResponse = ApiJson<'/api/blog/posts', 'get'>

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
    queryFn: () => adminApi.get(stripLeadingSlash(ENDPOINTS.blog.postBySlug(slug))).json<Post>(),
    staleTime: 0,
  })
}
