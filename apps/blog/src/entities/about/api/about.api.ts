import { apiFetch, ENDPOINTS } from '@hyunwoo/shared/api'
import { CACHE_TAGS } from '@hyunwoo/shared/config'
import type { Locale, Profile } from '@hyunwoo/shared/types'
import type {
  ApiEducation,
  ApiExperience,
  ApiLocale,
  ApiProfileResponse,
  ApiProject,
  ApiSkillGroup,
} from '@/entities/about/model'

export async function getProfile(locale: Locale): Promise<Profile | null> {
  const [profile, experiences, projects, skills, education] = await Promise.all([
    apiFetch<ApiProfileResponse>(`${ENDPOINTS.portfolio.profile}?locale=${locale}`, {
      tags: [CACHE_TAGS.PORTFOLIO_PROFILE],
    }),
    apiFetch<ApiExperience[]>(`${ENDPOINTS.portfolio.experiences}?locale=${locale}`, {
      tags: [CACHE_TAGS.PORTFOLIO_EXPERIENCES],
    }),
    apiFetch<ApiProject[]>(`${ENDPOINTS.portfolio.projects}?locale=${locale}`, {
      tags: [CACHE_TAGS.PORTFOLIO_PROJECTS],
    }),
    apiFetch<ApiSkillGroup[]>(ENDPOINTS.portfolio.skills, {
      tags: [CACHE_TAGS.PORTFOLIO_SKILLS],
    }),
    apiFetch<ApiEducation[]>(`${ENDPOINTS.portfolio.education}?locale=${locale}`, {
      tags: [CACHE_TAGS.PORTFOLIO_EDUCATION],
    }),
  ])

  if (!profile) return null

  return {
    name: profile.name,
    job: profile.jobTitle,
    location: profile.location,
    imageUrl: profile.imageUrl,
    link: profile.socialLinks.map(sl => ({
      name: sl.name,
      href: sl.href,
      icon: sl.icon,
    })),
    introduction: profile.introduction,
    education: education,
    skills: skills,
    experience: experiences
      ? experiences.map(exp => ({
          title: exp.title,
          role: exp.role,
          period: exp.isCurrent ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`,
          responsibilities: exp.responsibilities,
        }))
      : null,
    projects: projects
      ? projects.map(p => ({
          title: p.title,
          description: p.description,
          techStack: p.techStack,
          demoUrl: p.demoUrl,
          repoUrl: p.repoUrl,
        }))
      : null,
  }
}

export async function getLocales(): Promise<ApiLocale[]> {
  const data = await apiFetch<ApiLocale[]>(ENDPOINTS.portfolio.locales, {
    tags: [CACHE_TAGS.PORTFOLIO_LOCALES],
  })
  return data ?? []
}
