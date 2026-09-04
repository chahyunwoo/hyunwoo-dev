import type { ApiOkJson, ENDPOINTS } from '@hyunwoo/shared/api'

/**
 * 응답 타입은 스펙에서 가져온다. 이름은 그대로 두어 소비 지점을 건드리지 않는다.
 *
 * 수동 선언이던 시절 실제 응답과 어긋난 부분:
 *   VisitorTimelineItem.city, .country  →  실제는 `string | null`인데 `string`
 *   AdminLog.entityId, .detail, .ipAddress → 같음
 *   DashboardData.recentPosts[].category  → 같음
 *   PopularPost.category                  → 같음
 */

export type DashboardData = ApiOkJson<typeof ENDPOINTS.analytics.dashboard, 'get'>
export type VisitorData = ApiOkJson<typeof ENDPOINTS.analytics.visitors, 'get'>
export type PopularPost = ApiOkJson<typeof ENDPOINTS.analytics.popularPosts, 'get'>[number]
export type ReferrerData = ApiOkJson<typeof ENDPOINTS.analytics.referrers, 'get'>
export type ReferrerItem = ReferrerData['referrers'][number]
export type ReferrerSummary = ReferrerData['summary']
export type VisitorTimelineItem = ApiOkJson<typeof ENDPOINTS.analytics.visitorsTimeline, 'get'>[number]
export type VisitorVisit = VisitorTimelineItem['visits'][number]
export type SystemInfo = ApiOkJson<typeof ENDPOINTS.analytics.system, 'get'>
export type AdminLog = ApiOkJson<typeof ENDPOINTS.analytics.adminLogs, 'get'>[number]

/**
 * 리퍼러 분류. 색·라벨 매핑의 키로 쓴다
 * (`entities/analytics/config/referrer-colors.ts`).
 *
 * 손으로 유니온을 쓰지 않고 스펙에서 끌어온다. 백엔드가 분류를 늘리면
 * (예: 'ai') 매핑에 그 키가 없어 여기서 컴파일이 터진다 — 화면에 빈 색이
 * 나가는 것보다 낫다.
 */
export type ReferrerCategory = ReferrerItem['category']
