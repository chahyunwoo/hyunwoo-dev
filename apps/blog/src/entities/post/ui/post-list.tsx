'use client'

import type { Post } from '@hyunwoo/shared/types'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/shared/ui'
import { PostCard } from './post-card'

const SIBLING_COUNT = 1

interface PostListProps {
  posts: Post[]
  total: number
  page: number
  totalPages: number
}

function getPageNumbers(page: number, totalPages: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
  const start = Math.max(2, page - SIBLING_COUNT)
  const end = Math.min(totalPages - 1, page + SIBLING_COUNT)

  pages.push(1)

  if (start > 2) {
    pages.push('ellipsis-start')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages - 1) {
    pages.push('ellipsis-end')
  }

  pages.push(totalPages)

  return pages
}

export function PostList({ posts, page, totalPages }: PostListProps) {
  const searchParams = useSearchParams()

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (targetPage <= 1) {
      params.delete('page')
    } else {
      params.set('page', String(targetPage))
    }
    const qs = params.toString()
    return qs ? `/?${qs}` : '/'
  }

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <Link href={`/blog/${post.meta.slug}`} key={post.meta.slug} className="block" prefetch={index < 4}>
            <PostCard post={post} index={index} />
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-0.5 flex-nowrap">
          <Link href={buildPageUrl(Math.max(1, page - 1))} prefetch={false}>
            <Button
              variant="ghost"
              size="icon"
              disabled={page <= 1}
              aria-label="이전 페이지"
              className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>

          {getPageNumbers(page, totalPages).map(p =>
            typeof p === 'string' ? (
              <span key={p} className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Link key={p} href={buildPageUrl(p)} prefetch={false}>
                <Button
                  variant={p === page ? 'default' : 'ghost'}
                  size="icon"
                  aria-label={`${p} 페이지`}
                  className="h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm cursor-pointer"
                >
                  {p}
                </Button>
              </Link>
            ),
          )}

          <Link href={buildPageUrl(Math.min(totalPages, page + 1))} prefetch={false}>
            <Button
              variant="ghost"
              size="icon"
              disabled={page >= totalPages}
              aria-label="다음 페이지"
              className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
