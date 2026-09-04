import { formatDate } from '@hyunwoo/shared/lib'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { BlogCategoryNavigator, SidebarTagCloud } from '@/entities/category'
import { getCategoriesWithTags, getRecentPosts, getTagCloud } from '@/entities/post'
import { OpenSearchButton } from '@/features/search'
import { Badge, SidebarError } from '@/shared/ui'

export async function BlogSidebar() {
  const [categories, recentPosts, tagData] = await Promise.all([
    getCategoriesWithTags().catch(() => null),
    getRecentPosts(5).catch(() => null),
    getTagCloud(15).catch(() => null),
  ])

  const hasData = (categories && categories.length > 0) || (recentPosts && recentPosts.length > 0)

  if (!hasData) {
    return (
      <aside className="w-full max-w-[240px] border-r pt-6 pb-12 pr-4 hidden md:flex md:flex-col items-center justify-center gap-3 sticky top-14 text-muted-foreground">
        <AlertCircle className="h-5 w-5 opacity-40" />
        <p className="text-xs">데이터를 불러올 수 없습니다</p>
      </aside>
    )
  }

  return (
    <aside className="w-full max-w-[240px] border-r pt-6 pb-12 pr-4 hidden md:flex md:flex-col gap-6 sticky top-14 overflow-y-auto">
      {categories === null ? (
        <SidebarError label="카테고리" />
      ) : (
        categories.length > 0 && <BlogCategoryNavigator categories={categories} variant="sidebar" />
      )}

      {tagData === null ? (
        <>
          <hr className="border-border mx-3" />
          <SidebarError label="태그" />
        </>
      ) : (
        tagData.tags.length > 0 && (
          <>
            <hr className="border-border mx-3" />
            <SidebarTagCloud
              tags={tagData.tags.map(t => [t.name, t.count] as [string, number])}
              totalCount={tagData.total}
              moreButton={
                <OpenSearchButton className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer underline underline-offset-2">
                  +{tagData.total - tagData.tags.length} more
                </OpenSearchButton>
              }
            />
          </>
        )
      )}

      {recentPosts === null ? (
        <>
          <hr className="border-border mx-3" />
          <SidebarError label="최근 포스트" />
        </>
      ) : (
        recentPosts.length > 0 && (
          <>
            <hr className="border-border mx-3" />
            <nav>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Recent</p>
              <div className="space-y-1">
                {recentPosts.map(post => (
                  <Link
                    key={post.meta.slug}
                    href={`/blog/${post.meta.slug}`}
                    className="block px-3 py-2 rounded-md hover:bg-accent transition-colors group"
                    title={post.meta.title}
                  >
                    <p className="text-sm text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                      {post.meta.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                        {post.meta.mainTag}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{formatDate(post.meta.date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </nav>
          </>
        )
      )}
    </aside>
  )
}
