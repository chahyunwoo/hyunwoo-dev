import type { paths } from './api.types'

/**
 * 생성된 OpenAPI 타입에서 필요한 부분만 꺼내 쓰는 헬퍼.
 *
 * 런타임 코드가 없다 — 기존 HTTP 클라이언트(admin의 ky `adminApi`, blog/portfolio의
 * `apiFetch`)를 그대로 두고 제네릭 인자만 이 타입으로 바꾸는 게 목적이다.
 *
 * 사용 예:
 *   adminApi.get('api/blog/posts').json<ApiJson<'/api/blog/posts', 'get'>>()
 */

type JsonBody<T> = T extends { content: { 'application/json': infer R } } ? R : never

/**
 * 성공 응답(200 또는 201)의 application/json 바디 타입.
 *
 * 200/201을 둘 다 보는 이유: 200만 보면 201로 응답하는 POST 라우트에서 조용히
 * `never`가 되어, 타입이 붙은 것처럼 보이는데 실제로는 아무것도 검사하지 않는
 * 상태가 된다.
 */
export type ApiJson<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  responses: infer R
}
  ? R extends { 200: infer Ok }
    ? JsonBody<Ok>
    : R extends { 201: infer Created }
      ? JsonBody<Created>
      : never
  : never

/** 해당 라우트의 쿼리 파라미터 타입. */
export type ApiQuery<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  parameters: { query?: infer Q }
}
  ? Q
  : never

/** 해당 라우트의 요청 바디(application/json) 타입. */
export type ApiBody<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  requestBody: infer B
}
  ? JsonBody<B>
  : never
