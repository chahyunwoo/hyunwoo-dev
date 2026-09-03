import { apiFetch, ENDPOINTS } from '@hyunwoo/shared/api'
import { CACHE_TAGS } from '@hyunwoo/shared/config'
import type { Education, ProfileResponse, SkillGroup, Work } from '@/entities/portfolio/model'

export interface RecentPost {
  id: number
  title: string
  slug: string
  description: string
  category: string
  publishedAt: string
  tags: { name: string }[]
}

export async function getProfile(locale = 'ko'): Promise<ProfileResponse | null> {
  return apiFetch<ProfileResponse>(`${ENDPOINTS.portfolio.profile}?locale=${locale}`, {
    tags: [CACHE_TAGS.PORTFOLIO_PROFILE],
  })
}

export async function getWorks(locale = 'ko', type?: string): Promise<Work[]> {
  const params = new URLSearchParams({ locale })
  if (type) params.set('type', type)
  const data = await apiFetch<Work[]>(`${ENDPOINTS.portfolio.works}?${params}`, {
    tags: [CACHE_TAGS.PORTFOLIO_WORKS],
  })
  return data ?? []
}

export async function getSkills(): Promise<SkillGroup[]> {
  const data = await apiFetch<SkillGroup[]>(ENDPOINTS.portfolio.skills, {
    tags: [CACHE_TAGS.PORTFOLIO_SKILLS],
  })
  return data ?? []
}

export async function getEducation(locale = 'ko'): Promise<Education[]> {
  const data = await apiFetch<Education[]>(`${ENDPOINTS.portfolio.education}?locale=${locale}`, {
    tags: [CACHE_TAGS.PORTFOLIO_EDUCATION],
  })
  return data ?? []
}

export async function getRecentPosts(): Promise<RecentPost[]> {
  const data = await apiFetch<RecentPost[]>(ENDPOINTS.blog.recentPosts, {
    tags: [CACHE_TAGS.BLOG_RECENT],
  })
  return data ?? []
}
