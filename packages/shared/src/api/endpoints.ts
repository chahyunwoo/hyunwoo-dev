import type { paths } from './generated/api.types'

/**
 * 스펙에 존재하는 정적 경로만 허용한다.
 *
 * `ENDPOINTS`의 값이 api-server의 실제 라우트와 갈라지는 것을 컴파일 시점에 막는다.
 * 백엔드가 경로를 바꾸고 스펙을 갱신하면(`pnpm api:sync && pnpm api:codegen`)
 * 여기서 타입 에러가 난다 — 런타임 404로 발견하는 것보다 낫다.
 *
 * 동적 경로(`postBySlug` 등)는 함수라 이 제약을 걸 수 없다. 그건 호출 시점에
 * 문자열을 만들기 때문이고, 대신 응답 타입을 꺼낼 때 스펙의 경로 템플릿
 * (`'/api/blog/posts/{slug}'`)을 쓰므로 그쪽에서 갈라짐이 드러난다.
 */
type SpecPath = keyof paths

/** 정적 경로는 SpecPath여야 하고, 동적 경로는 함수면 된다. */
type EndpointGroup = Record<string, SpecPath | ((...args: never[]) => string)>

export const ENDPOINTS = {
  blog: {
    posts: '/api/blog/posts',
    postBySlug: (slug: string) => `/api/blog/posts/${slug}`,
    recentPosts: '/api/blog/posts/recent',
    search: '/api/blog/posts/search',
    relatedPosts: (slug: string) => `/api/blog/posts/${slug}/related`,
    categories: '/api/blog/categories',
    categoryById: (id: number) => `/api/blog/categories/${id}`,
    tags: '/api/blog/tags',
    postPreview: (slug: string) => `/api/blog/posts/${slug}/preview`,
    images: '/api/blog/images',
  },
  portfolio: {
    profile: '/api/portfolio/profile',
    experiences: '/api/portfolio/experiences',
    projects: '/api/portfolio/projects',
    skills: '/api/portfolio/skills',
    education: '/api/portfolio/education',
    locales: '/api/portfolio/locales',
    works: '/api/portfolio/works',
    workById: (id: number) => `/api/portfolio/works/${id}`,
    experienceById: (id: number) => `/api/portfolio/experiences/${id}`,
    projectById: (id: number) => `/api/portfolio/projects/${id}`,
    educationById: (id: number) => `/api/portfolio/education/${id}`,
    profileAll: '/api/portfolio/profile/all',
    profileImage: '/api/portfolio/profile/image',
    profileIcon: '/api/portfolio/profile/icon',
    skillById: (id: number) => `/api/portfolio/skills/${id}`,
    localeById: (id: number) => `/api/portfolio/locales/${id}`,
    contact: '/api/portfolio/contact',
    contacts: '/api/portfolio/contacts',
    contactById: (id: number) => `/api/portfolio/contacts/${id}`,
    contactRead: (id: number) => `/api/portfolio/contacts/${id}/read`,
  },
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    logoutAll: '/api/auth/logout-all',
    refresh: '/api/auth/refresh',
    sessionExtend: '/api/auth/session/extend',
    previewToken: '/api/auth/preview-token',
    verifyPreview: '/api/auth/verify-preview',
    twoFactorSetup: '/api/auth/2fa/setup',
    twoFactorEnable: '/api/auth/2fa/enable',
    twoFactorDisable: '/api/auth/2fa/disable',
    twoFactorVerify: '/api/auth/2fa/verify',
    twoFactorStatus: '/api/auth/2fa/status',
  },
  analytics: {
    pageView: '/api/analytics/pageview',
    dashboard: '/api/analytics/dashboard',
    visitors: '/api/analytics/visitors',
    visitorsTimeline: '/api/analytics/visitors/timeline',
    popularPosts: '/api/analytics/popular-posts',
    referrers: '/api/analytics/referrers',
    system: '/api/analytics/system',
    adminLogs: '/api/analytics/admin-logs',
  },
} as const satisfies Record<string, EndpointGroup>
