'use client'

import { trackPageview } from '@hyunwoo/shared/lib'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function PageviewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    trackPageview(pathname, 'portfolio')
  }, [pathname])

  return null
}
