import type { ApiOkJson, ENDPOINTS } from '@hyunwoo/shared/api'

/**
 * 응답 타입을 손으로 선언하지 않고 api-server의 OpenAPI 스펙에서 생성한 타입을 쓴다.
 * 백엔드 DTO가 바뀌면 여기 타입이 바뀌고 참조부에서 타입 에러가 난다.
 *
 * 이름은 그대로 두어 소비 지점을 건드리지 않는다 — 바뀌는 것은 정의의 출처뿐이다.
 *
 * 수동 선언이던 시절 실제 응답과 어긋난 부분이 있었다:
 *   description, category  →  실제는 `string | null`인데 `string`으로 선언
 *   viewCount              →  응답에 실리는데 선언 없음
 *   tags[].slug            →  응답에 실리는데 선언 없음
 *
 * 동적 경로(`{slug}`)는 `ENDPOINTS`의 해당 항목이 함수라 `typeof`로 묶을 수 없어
 * 스펙의 경로 템플릿을 그대로 쓴다. 생성 타입의 키가 그 형태다.
 */

export type ApiPostsResponse = ApiOkJson<typeof ENDPOINTS.blog.posts, 'get'>

/** 목록 응답의 요소. 상세와 달리 `content`가 없다. */
export type ApiPost = ApiPostsResponse['posts'][number]

/** 상세 응답. 목록 요소에 `content`(MDX 원문)가 더해진다. */
export type ApiPostDetail = ApiOkJson<'/api/blog/posts/{slug}', 'get'>

export type ApiCategoriesResponse = ApiOkJson<typeof ENDPOINTS.blog.categories, 'get'>
export type ApiCategory = ApiCategoriesResponse[number]

export type ApiTagsResponse = ApiOkJson<typeof ENDPOINTS.blog.tags, 'get'>

export type ApiRelatedResponse = ApiOkJson<'/api/blog/posts/{slug}/related', 'get'>
