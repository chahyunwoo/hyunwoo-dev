'use client'

import { cn } from '@hyunwoo/shared/lib'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/shared/ui'

interface SidebarTagCloudProps {
  tags: [string, number][]
  totalCount: number
  /**
   * 숨겨진 태그 수를 보여주는 "+N more" 자리. 누르면 검색이 열려야 하는데,
   * 검색 스토어는 features 레이어에 있어 entities 가 직접 구독할 수 없다.
   * 그래서 렌더할 요소를 위(widgets)에서 받는다.
   */
  renderMoreButton?: (label: string) => React.ReactNode
}

export function SidebarTagCloud({ tags, totalCount, renderMoreButton }: SidebarTagCloudProps) {
  const searchParams = useSearchParams()
  const currentTag = searchParams.get('tag') || ''

  return (
    <nav>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Tags</p>
      <div className="flex flex-wrap gap-2 px-3">
        {tags.map(([tag, count]) => {
          const isActive = currentTag === tag
          const href = isActive ? '/' : `/?tag=${tag}`

          return (
            <Link key={tag} href={href} prefetch={false}>
              <Badge
                variant={isActive ? 'default' : 'outline'}
                className={cn(
                  'text-[10px] transition-colors cursor-pointer min-h-[28px] py-1',
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                )}
              >
                {tag}
                <span className={cn('ml-1', isActive ? 'text-primary-foreground/70' : 'opacity-50')}>{count}</span>
              </Badge>
            </Link>
          )
        })}
      </div>
      {totalCount > tags.length && renderMoreButton && (
        <div className="flex justify-end px-3 mt-2">{renderMoreButton(`+${totalCount - tags.length} more`)}</div>
      )}
    </nav>
  )
}
