import type { ApiOkJson } from '@hyunwoo/shared/api'
import { ENDPOINTS } from '@hyunwoo/shared/api'
import { queryOptions } from '@tanstack/react-query'
import { adminApi } from '@/shared/api'
import { queryKeys } from '@/shared/config'
import { stripLeadingSlash } from '@/shared/lib'

/**
 * 경로는 `ENDPOINTS`에서, 응답 타입은 스펙에서 가져온다.
 *
 * `ENDPOINTS`의 정적 경로는 `keyof paths`로 제약돼 있어 스펙에 없는 경로면
 * 거기서 컴파일이 터진다. 응답 타입도 같은 스펙에서 나오므로 경로와 타입이
 * 따로 놀 수 없다.
 *
 * `stripLeadingSlash`는 ky의 `prefixUrl`이 선행 슬래시를 허용하지 않아 필요하다.
 * `ENDPOINTS`는 서버 경로 그대로(`/api/...`)를 담고, 여기서 클라이언트 사정에
 * 맞춰 벗긴다 — 카탈로그가 특정 HTTP 클라이언트에 종속되지 않게.
 */
type Dashboard = ApiOkJson<typeof ENDPOINTS.analytics.dashboard, 'get'>
type Visitors = ApiOkJson<typeof ENDPOINTS.analytics.visitors, 'get'>
type PopularPosts = ApiOkJson<typeof ENDPOINTS.analytics.popularPosts, 'get'>
type Referrers = ApiOkJson<typeof ENDPOINTS.analytics.referrers, 'get'>
type VisitorsTimeline = ApiOkJson<typeof ENDPOINTS.analytics.visitorsTimeline, 'get'>
type SystemStatus = ApiOkJson<typeof ENDPOINTS.analytics.system, 'get'>
type AdminLogs = ApiOkJson<typeof ENDPOINTS.analytics.adminLogs, 'get'>

export function dashboardOptions() {
  return queryOptions({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: () => adminApi.get(stripLeadingSlash(ENDPOINTS.analytics.dashboard)).json<Dashboard>(),
  })
}

export function visitorsOptions(days?: number, app = 'blog') {
  const params = new URLSearchParams({ app })
  if (days !== undefined) params.set('days', String(days))

  return queryOptions({
    queryKey: days !== undefined ? queryKeys.analytics.visitors(days, app) : queryKeys.analytics.visitorsTotal,
    queryFn: () => adminApi.get(`${stripLeadingSlash(ENDPOINTS.analytics.visitors)}?${params}`).json<Visitors>(),
  })
}

export function popularPostsOptions(limit = 10, days?: number) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (days !== undefined) params.set('days', String(days))

  return queryOptions({
    queryKey: queryKeys.analytics.popularPosts(limit, days),
    queryFn: () =>
      adminApi.get(`${stripLeadingSlash(ENDPOINTS.analytics.popularPosts)}?${params}`).json<PopularPosts>(),
  })
}

export function referrersOptions(days = 30, app = 'blog') {
  const params = new URLSearchParams({ days: String(days), app })

  return queryOptions({
    queryKey: queryKeys.analytics.referrers(days, app),
    queryFn: () => adminApi.get(`${stripLeadingSlash(ENDPOINTS.analytics.referrers)}?${params}`).json<Referrers>(),
  })
}

export function visitorsTimelineOptions(days = 7, app = 'blog') {
  const params = new URLSearchParams({ days: String(days), app })

  return queryOptions({
    queryKey: queryKeys.analytics.visitorsTimeline(days, app),
    queryFn: () =>
      adminApi.get(`${stripLeadingSlash(ENDPOINTS.analytics.visitorsTimeline)}?${params}`).json<VisitorsTimeline>(),
  })
}

export function systemOptions() {
  return queryOptions({
    queryKey: queryKeys.analytics.system,
    queryFn: () => adminApi.get(stripLeadingSlash(ENDPOINTS.analytics.system)).json<SystemStatus>(),
  })
}

export function adminLogsOptions(limit = 20) {
  const params = new URLSearchParams({ limit: String(limit) })

  return queryOptions({
    queryKey: queryKeys.analytics.adminLogs(limit),
    queryFn: () => adminApi.get(`${stripLeadingSlash(ENDPOINTS.analytics.adminLogs)}?${params}`).json<AdminLogs>(),
  })
}
