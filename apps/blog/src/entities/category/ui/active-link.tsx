'use client'

import { cn } from '@hyunwoo/shared/lib'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge, Button } from '@/shared/ui'

interface ActiveLinkProps {
  href: string
  title: string
  className?: string
  onClick?: () => void
  count?: number
  icon?: LucideIcon
  newBadge?: boolean
  isActive?: boolean
  prefetch?: boolean
}

export function ActiveLink({
  href,
  title,
  className,
  onClick,
  count,
  icon: Icon,
  newBadge = false,
  isActive: isActiveProp,
  prefetch = true,
}: ActiveLinkProps) {
  const pathname = usePathname()
  const isActive =
    isActiveProp !== undefined
      ? isActiveProp
      : pathname === href ||
        (href === '/' && (pathname === '/blog' || pathname.startsWith('/blog/'))) ||
        (href !== '/' && pathname.startsWith(href))

  return (
    <Link href={href} prefetch={prefetch}>
      <Button
        onClick={onClick}
        variant="ghost"
        className={cn(
          'relative p-0 cursor-pointer w-full justify-between text-sm text-muted-foreground hover:text-foreground transition-colors rounded-none',
          isActive && 'text-primary',
          isActive && Icon && 'bg-primary/10',
          className,
        )}
      >
        {isActive && Icon && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full" />
        )}
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />}
          <span className="truncate">{title}</span>
          {newBadge && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 text-red-500 border-none shrink-0">
              New
            </Badge>
          )}
        </div>
        {count && (
          <div className="flex items-center gap-1 shrink-0">
            <span className={cn('text-xs tabular-nums', isActive ? 'text-primary' : 'text-muted-foreground')}>
              {count}
            </span>
          </div>
        )}
      </Button>
    </Link>
  )
}
