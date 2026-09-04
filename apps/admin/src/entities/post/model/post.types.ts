// 응답 타입은 손으로 선언하지 않는다. api-server의 OpenAPI 스펙에서 생성한 타입을
// `ApiOkJson<경로, 메서드>`로 꺼내 쓴다 — entities/post/api/ 참고.
//
// 수동 Post 인터페이스를 제거했다. 그 타입은 description·category를 string으로
// 선언했지만 실제 응답은 string | null이었고, 그 거짓말 때문에 post-edit-page에서
// null 처리가 빠져 있었다(생성 타입으로 바꾸며 컴파일 에러로 드러났다).
//
// 아래 요청 바디 타입은 아직 수동이다. 스펙에 requestBody 스키마가 있으므로
// 같은 방식으로 대체할 수 있다.

export interface PostListParams {
  page?: number
  limit?: number
  category?: string
}

export interface CreatePostBody {
  title: string
  description?: string
  content: string
  category?: string
  tags?: string[]
  thumbnailUrl?: string
  published: boolean
  publishedAt?: string
}

export interface UpdatePostBody extends Partial<CreatePostBody> {}
