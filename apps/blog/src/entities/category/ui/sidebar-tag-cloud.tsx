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
   * 그래서 이미 만들어진 요소를 위(widgets)에서 받는다.
   *
   * **함수가 아니라 ReactNode 여야 한다.** 이 컴포넌트는 'use client' 이고
   * 부모(BlogSidebar)는 서버 컴포넌트라, 함수를 prop 으로 넘기면
   * "Functions cannot be passed directly to Client Components" 로 렌더가
   * 통째로 죽는다(실측 — 사이드바의 카테고리·태그가 전부 사라졌다).
   * 라벨은 넘기는 쪽에서 이미 알고 있으므로 함수일 이유도 없다.
   */
  moreButton?: React.ReactNode
}

export function SidebarTagCloud({ tags, totalCount, moreButton }: SidebarTagCloudProps) {
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
      {totalCount > tags.length && moreButton && <div className="flex justify-end px-3 mt-2">{moreButton}</div>}
    </nav>
  )
}
