import type { paths } from './generated/api.types'

/**
 * 생성된 OpenAPI 타입(`generated/api.types.ts`)에서 필요한 부분만 꺼내 쓰는 헬퍼.
 *
 * 이 파일은 손으로 쓴 것이라 `generated/` 안에 두지 않는다 — 생성 디렉토리에 수기 파일이
 * 섞여 있으면 재생성 시 함께 날아갈 수 있고, 린트/포맷 제외 범위도 뭉뚱그려진다.
 *
 * 런타임 코드가 없다. 기존 HTTP 클라이언트(admin의 ky `adminApi`, blog/portfolio의
 * `apiFetch`)를 그대로 두고 제네릭 인자만 이 타입으로 바꾸는 게 목적이다.
 *
 * 사용 예:
 *   adminApi.get(...).json<ApiOkJson<'/api/blog/posts', 'get'>>()
 */

declare const missingResponseSchema: unique symbol

/**
 * 성공 응답 스키마가 없는 라우트에 `ApiOkJson`을 쓰면 이 타입이 나온다.
 *
 * 여기서 `never`를 돌려주면 안 된다 — `never`는 모든 타입의 서브타입이라 어떤 타입에도
 * 조용히 대입된다. 그러면 "타입을 붙였다"는 착각만 남은 채 아무것도 검사하지 않는 상태가 된다:
 *
 *   queryFn: (): Promise<Post> => api.get(...).json<ApiOkJson<'스키마없는라우트', 'get'>>()
 *   // never를 쓰면 위가 에러 없이 통과한다
 *
 * 이 스펙의 72개 오퍼레이션 중 성공 응답 스키마가 있는 건 아직 1개뿐이라, 나머지를 교체할 때
 * 백엔드에 @ApiOkResponse 붙이는 걸 빠뜨리기 쉽다. 대입 시점에 컴파일이 터지도록 고유 심볼로
 * 브랜딩한다.
 *
 * 알아둘 것 두 가지:
 * - 진단 메시지에는 보통 `MissingResponseSchema<"/api/...">`까지만 나오고, 아래 안내 문자열은
 *   에디터에서 타입을 펼쳐야(호버) 보인다. 라우트 이름이 보이는 것만으로 원인은 짚을 수 있다.
 * - 만능은 아니다. 대상 타입이 `{}` / `object` / `unknown` / `Record<string, unknown>`처럼
 *   아무 구조도 요구하지 않으면 그대로 대입된다. 필수 프로퍼티가 하나라도 있는 타입,
 *   전부 옵셔널인 타입(weak type 검사), 배열, 프로퍼티 접근은 전부 막힌다.
 */
export type MissingResponseSchema<P extends string> = {
  [missingResponseSchema]: `'${P}' 라우트에 성공 응답 JSON 스키마가 없습니다. 본문이 있는 라우트라면 api-server 컨트롤러에 @ApiOkResponse({ type: XxxDto })를 붙이고 pnpm api:sync && pnpm api:codegen 을 돌리세요. 본문이 없는 라우트(204 등)라면 이 헬퍼를 쓰지 말고 반환 타입을 void로 두세요.`
}

type JsonBody<T> = T extends { content: { 'application/json': infer R } } ? R : never

/**
 * 200을 먼저 보되, 200이 스키마 없이 선언된 경우(`content?: never`) 201로 넘어간다.
 * NestJS의 POST는 기본이 201이라 `@ApiResponse({ status: 200 })` + `@ApiCreatedResponse({ type })`
 * 조합이 생길 수 있는데, 200을 무조건 우선하면 그 경우 201의 스키마를 못 본다.
 */
type SuccessBody<R> = R extends { 200: infer Ok }
  ? [JsonBody<Ok>] extends [never]
    ? R extends { 201: infer Created }
      ? JsonBody<Created>
      : never
    : JsonBody<Ok>
  : R extends { 201: infer Created }
    ? JsonBody<Created>
    : never

type RawSuccessBody<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  responses: infer R
}
  ? SuccessBody<R>
  : never

/**
 * 해당 라우트의 성공 응답(200 우선, 없으면 201) application/json 바디 타입.
 *
 * 스키마가 없으면 {@link MissingResponseSchema}가 나와서 대입 시점에 컴파일 에러가 난다.
 */
export type ApiOkJson<P extends keyof paths, M extends keyof paths[P]> = [RawSuccessBody<P, M>] extends [never]
  ? MissingResponseSchema<P & string>
  : RawSuccessBody<P, M>
