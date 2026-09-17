import { getRelatedPosts } from '@/entities/post/api/post.api'
import { RelatedPostCard } from './related-post-card'

interface RelatedPostsProps {
  slug: string
}

export async function RelatedPosts({ slug }: RelatedPostsProps) {
  const { related, recommended } = await getRelatedPosts(slug)
  const allPosts = [...related, ...recommended]

  if (allPosts.length === 0) return null

  const hasOnlyRelated = related.length === 3
  const hasOnlyRecommended = recommended.length === 3
  const isMixed = related.length > 0 && recommended.length > 0 && !hasOnlyRelated && !hasOnlyRecommended

  return (
    <div className="mt-4 pt-8 border-t border-border not-prose">
      {!isMixed && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full" />
          {hasOnlyRelated ? '연관 게시글' : '추천 게시글'}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isMixed ? (
          <>
            {related.map((post, i) => (
              <div key={post.meta.slug} className={i === related.length - 1 ? 'sm:border-r sm:pr-4 border-border' : ''}>
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${i === 0 ? 'text-muted-foreground' : 'hidden sm:flex sm:invisible'}`}
                >
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  연관 게시글
                </p>
                <RelatedPostCard post={post} />
              </div>
            ))}
            {recommended.map((post, i) => (
              <div key={post.meta.slug}>
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${i === 0 ? 'text-muted-foreground' : 'hidden sm:flex sm:invisible'}`}
                >
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  추천 게시글
                </p>
                <RelatedPostCard post={post} />
              </div>
            ))}
          </>
        ) : (
          allPosts.map(post => <RelatedPostCard key={post.meta.slug} post={post} />)
        )}
      </div>
    </div>
  )
}
