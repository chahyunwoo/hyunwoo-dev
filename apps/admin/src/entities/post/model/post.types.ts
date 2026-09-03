export interface Post {
  id: number
  slug: string
  title: string
  description: string
  content?: string
  category: string
  thumbnailUrl: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  tags: { id: number; name: string }[]
}

// PostListResponse는 제거됐다. GET /api/blog/posts 응답 타입은 api-server의 OpenAPI
// 스펙에서 생성한다 — entities/post/api/post.options.ts의 ApiOkJson<...> 참고.
// 나머지 수동 타입(Post, CreatePostBody, UpdatePostBody)도 같은 방식으로 대체할 대상이다.

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
