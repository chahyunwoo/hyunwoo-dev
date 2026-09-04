'use client'

import { LINK_TYPES } from '@hyunwoo/shared/config'
import { getParamFromHref } from '@hyunwoo/shared/lib'
import type { CategoryData, LinkType } from '@hyunwoo/shared/types'
import { getIcon } from '@hyunwoo/ui'
import { LayoutGrid } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { ActiveLink } from './active-link'

interface BlogCategoryNavigatorProps {
  categories: CategoryData[]
  variant: 'menu' | 'sidebar'
  closeMenu?: () => void
}

export function BlogCategoryNavigator({ categories, variant, closeMenu = () => {} }: BlogCategoryNavigatorProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlParams = {
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    parentCategory: searchParams.get('parentCategory') || '',
  }

  const totalPostCount = categories.reduce((sum, cat) => sum + cat.postCount, 0)

  const checkIsActive = (href: string, title: string, type: LinkType) => {
    switch (type) {
      case LINK_TYPES.ALL: {
        const hasNoParams = !urlParams.category && !urlParams.tag && !urlParams.parentCategory
        return pathname === '/' && hasNoParams
      }

      case LINK_TYPES.CATEGORY: {
        const categoryName = getParamFromHref('category', href)
        return urlParams.category === categoryName || urlParams.parentCategory === title
      }

      default:
        return pathname === href || (href === '/' && pathname.startsWith('/blog/'))
    }
  }

  const categoriesContent = (
    <div className="space-y-0.5">
      <ActiveLink
        href="/"
        title="ALL"
        icon={LayoutGrid}
        className="w-full justify-between px-3 py-1.5"
        count={totalPostCount}
        onClick={closeMenu}
        isActive={checkIsActive('/', 'ALL', LINK_TYPES.ALL)}
        prefetch={false}
      />

      {categories.map(item => (
        <ActiveLink
          key={item.category}
          href={`/?category=${item.category}`}
          title={item.category}
          icon={getIcon(item.icon)}
          className="w-full justify-between px-3 py-1.5"
          count={item.postCount}
          newBadge={item.recent}
          onClick={closeMenu}
          isActive={checkIsActive(`/?category=${item.category}`, item.category, LINK_TYPES.CATEGORY)}
          prefetch={false}
        />
      ))}
    </div>
  )

  if (variant === 'menu') {
    return categoriesContent
  }

  return (
    <nav>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Categories</p>
      {categoriesContent}
    </nav>
  )
}
