import { useNavigate } from '@tanstack/react-router'
import { usePostDetail, useUpdatePost } from '@/entities/post'
import { CategoryModal } from '@/features/category'
import { PostForm } from '@/features/post'
import type { PostFormValues } from '@/shared/schemas'

interface PostEditPageProps {
  slug: string
}

export function PostEditPage({ slug }: PostEditPageProps) {
  const navigate = useNavigate()
  const { data: post } = usePostDetail(slug)
  const updatePost = useUpdatePost(slug)

  const handleSubmit = (values: PostFormValues) => {
    updatePost.mutate(
      {
        ...values,
        thumbnailUrl: values.thumbnailUrl || undefined,
        publishedAt: values.publishedAt || undefined,
      },
      {
        onSuccess: () => navigate({ to: '/posts' }),
      },
    )
  }

  return (
    <PostForm
      mode="edit"
      defaultValues={{
        title: post.title,
        // description·category는 응답에서 null일 수 있다. 수동 타입이 string이라고
        // 선언해 두어 지금까지 드러나지 않았고, 생성 타입으로 바꾸며 잡혔다.
        description: post.description ?? '',
        content: post.content ?? '',
        category: post.category ?? '',
        tags: post.tags.map(t => t.name),
        thumbnailUrl: post.thumbnailUrl ?? '',
        published: post.published,
        publishedAt: post.publishedAt ? post.publishedAt.split('T')[0] : '',
      }}
      slug={slug}
      onSubmit={handleSubmit}
      isPending={updatePost.isPending}
      renderCategoryModal={props => <CategoryModal {...props} />}
    />
  )
}
