import { getPaginatedPosts } from '@/entities/post/api/post.api'
import { ApiError } from '@/shared/ui'
import { PostList } from './post-list'

export async function PostListContainer({
  category,
  tag,
  parentCategory,
  page,
}: {
  category?: string
  tag?: string
  parentCategory?: string
  page?: number
}) {
  const result = await getPaginatedPosts({
    page: page || 1,
    limit: 9,
    category: category || parentCategory,
    tag,
  })

  if (result.posts.length === 0 && result.total === 0) {
    return <ApiError message="포스트를 불러올 수 없습니다." />
  }

  return <PostList posts={result.posts} total={result.total} page={result.page} totalPages={result.totalPages} />
}
