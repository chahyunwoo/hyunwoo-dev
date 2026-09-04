import { apiFetch, ENDPOINTS } from '@hyunwoo/shared/api'
import { CACHE_TAGS } from '@hyunwoo/shared/config'
import type { CategoryData, Post, PostMeta } from '@hyunwoo/shared/types'
import { cache } from 'react'
import type {
  ApiCategory,
  ApiPost,
  ApiPostDetail,
  ApiPostsResponse,
  ApiRelatedResponse,
  ApiTagsResponse,
} from '../model'

/**
 * 목록 요소와 상세를 모두 받는다. 상세에만 `content`(MDX 원문)가 있으므로
 * 목록에서 온 것은 빈 문자열이 된다.
 *
 * `description`·`category`는 응답에서 null일 수 있다. 수동 타입이 `string`이라고
 * 선언해 두어 지금까지 드러나지 않았고, 생성 타입으로 바꾸며 컴파일 에러로 잡혔다.
 */
function toPost(api: ApiPost | ApiPostDetail): Post {
  const meta: PostMeta = {
    title: api.title,
    description: api.description ?? '',
    date: api.publishedAt ?? api.createdAt,
    mainTag: api.category ?? '',
    tags: api.tags.map(t => t.name),
    thumbnail: api.thumbnailUrl || '',
    published: api.published,
    slug: api.slug,
    readingTime: api.readingTime,
    updatedAt: api.updatedAt,
  }

  return { meta, content: 'content' in api ? (api.content ?? '') : '' }
}

export interface PaginatedPosts {
  posts: Post[]
  total: number
  page: number
  totalPages: number
}

export const getPaginatedPosts = async (params?: {
  page?: number
  limit?: number
  category?: string
  tag?: string
}): Promise<PaginatedPosts> => {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('limit', String(params?.limit || 9))
  if (params?.category) searchParams.set('category', params.category)
  if (params?.tag) searchParams.set('tag', params.tag)

  const data = await apiFetch<ApiPostsResponse>(`${ENDPOINTS.blog.posts}?${searchParams}`, {
    tags: [CACHE_TAGS.BLOG_POSTS],
  })

  if (!data) return { posts: [], total: 0, page: 1, totalPages: 0 }

  return {
    posts: data.posts.map(toPost),
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
  }
}

export const getPublishedPosts = async (): Promise<Post[]> => {
  const first = await getPaginatedPosts({ limit: 1 })
  if (first.total === 0) return []
  const result = await getPaginatedPosts({ limit: first.total })
  return result.posts
}

export const getRecentPosts = async (limit = 5): Promise<Post[]> => {
  const data = await apiFetch<ApiPost[]>(`${ENDPOINTS.blog.recentPosts}?limit=${limit}`, {
    tags: [CACHE_TAGS.BLOG_POSTS],
  })
  if (!data) return []
  return data.map(toPost)
}

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const data = await apiFetch<ApiPost>(ENDPOINTS.blog.postBySlug(slug), {
    tags: [CACHE_TAGS.BLOG_POST(slug)],
  })
  if (!data) return null
  return toPost(data)
}

export const getRelatedPosts = async (slug: string): Promise<{ related: Post[]; recommended: Post[] }> => {
  const data = await apiFetch<ApiRelatedResponse>(ENDPOINTS.blog.relatedPosts(slug), {
    tags: [CACHE_TAGS.BLOG_POSTS],
  })

  if (!data) return { related: [], recommended: [] }

  return {
    related: data.related.map(toPost),
    recommended: data.recommended.map(toPost),
  }
}

export const getCategoriesWithTags = cache(async (): Promise<CategoryData[]> => {
  const data = await apiFetch<ApiCategory[]>(ENDPOINTS.blog.categories, {
    tags: [CACHE_TAGS.BLOG_CATEGORIES],
  })

  if (!data) return []

  return data.map(cat => ({
    category: cat.category,
    icon: cat.icon,
    subCategory: cat.tags.map(t => ({ name: t.name, count: t.count })),
    postCount: cat.count,
    recent: cat.recent,
  }))
})

export const getTagCloud = async (limit = 15): Promise<{ tags: { name: string; count: number }[]; total: number }> => {
  const data = await apiFetch<ApiTagsResponse>(`${ENDPOINTS.blog.tags}?limit=${limit}`, {
    tags: [CACHE_TAGS.BLOG_TAGS],
  })

  if (!data) return { tags: [], total: 0 }

  return {
    tags: data.tags.map(t => ({ name: t.name, count: t.count })),
    total: data.total,
  }
}
