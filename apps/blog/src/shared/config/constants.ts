import { BASE_URL } from '@hyunwoo/shared/config'
import type { MenuItem } from '@hyunwoo/shared/types'
import { Github, Instagram, Laptop, Linkedin, type LucideIcon, Moon, Sun } from 'lucide-react'

export const MENU_ITEMS: MenuItem[] = [
  { name: 'Blog', href: '/' },
  { name: 'About', href: '/about/ko' },
]

export const THEME_TYPES = [
  { name: 'light', icon: Sun },
  { name: 'dark', icon: Moon },
  { name: 'system', icon: Laptop },
]

export const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  Github,
  Instagram,
  Linkedin,
}

export const CONTACT_EMAIL = 'chahyunwoobi@gmail.com'

export const GISCUS_CONFIG = {
  repo: 'chahyunwoo/hyunwoo-dev',
  repoId: 'R_kgDOOKi_qg',
  category: 'Announcements',
  categoryId: 'DIC_kwDOOKi_qs4Coeoz',
} as const

// 페이지가 metadata.alternates 를 정의하면 레이아웃 값을 통째로 덮으므로 각 페이지에 같이 넣는다.
export const RSS_ALTERNATE_TYPES = { 'application/rss+xml': `${BASE_URL}/rss.xml` }
