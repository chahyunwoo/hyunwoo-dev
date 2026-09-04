import { ENDPOINTS } from '../api/endpoints'
import { API_URL, DEFAULT_HEADERS } from '../config/api.config'

/**
 * 방문 기록을 수집 API로 보낸다.
 *
 * 앱마다 따로 구현하지 않고 여기 한 곳을 통한다. 과거 블로그에만 추적이 붙어
 * 있었고 포트폴리오·어드민에는 호출부가 아예 없어, 대시보드에 blog 데이터만
 * 쌓이는 상태였다(실측 2026-09-04: analytics.page_views의 app_name이 blog 단일).
 *
 * 실패는 의도적으로 삼킨다 — 통계 수집이 화면 동작을 막아서는 안 된다.
 * `keepalive`를 켜서 페이지를 떠나는 중에도 전송이 완료되게 한다.
 */
export function trackPageview(path: string, appName: string) {
  if (typeof window === 'undefined') return

  fetch(`${API_URL}${ENDPOINTS.analytics.pageView}`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({
      path,
      appName,
      referrer: document.referrer || '',
    }),
    keepalive: true,
  }).catch(() => {})
}
