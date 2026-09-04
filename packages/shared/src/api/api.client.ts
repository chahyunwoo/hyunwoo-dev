import { API_URL, DEFAULT_HEADERS, DEFAULT_REVALIDATE } from '../config/api.config'

interface FetchOptions {
  revalidate?: number | false
  tags?: string[]
}

/**
 * 실패를 조용히 삼키지 않기 위한 로깅.
 *
 * 이 모듈은 실패 시 `null`을 돌려주고, 호출부는 그것을 빈 배열이나 기본값으로
 * 치환한다. 그래서 **API 장애와 "데이터가 없음"이 구별되지 않는다.**
 * 빌드 타임에 API가 죽어 있으면 글 0개짜리 sitemap과 프리렌더 0개 배포가
 * 에러 하나 없이 나갈 수 있다(실측 2026-09-04).
 *
 * `null` 반환 계약은 그대로 둔다 — 호출부 17곳이 그 계약에 맞춰져 있어
 * throw로 바꾸면 화면 전체가 죽는 쪽으로 실패 양상이 바뀐다. 대신 실패한
 * 사실만은 반드시 흔적을 남겨, 빌드 로그나 서버 로그에서 검색 가능하게 한다.
 *
 * 404는 정상적인 "없음"이므로 로그를 남기지 않는다.
 */
function logFailure(path: string, reason: string): void {
  // 빌드/서버에서는 stderr, 브라우저에서는 콘솔에 남는다.
  console.error(`[apiFetch] ${path} — ${reason}`)
}

export async function apiFetch<T>(path: string, options?: FetchOptions): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: DEFAULT_HEADERS,
      next: {
        revalidate: options?.revalidate ?? DEFAULT_REVALIDATE,
        tags: options?.tags,
      },
    } as RequestInit)

    if (!res.ok) {
      if (res.status !== 404) logFailure(path, `HTTP ${res.status}`)
      return null
    }

    return (await res.json()) as T
  } catch (e) {
    logFailure(path, e instanceof Error ? e.message : String(e))
    return null
  }
}

export async function apiClientFetch<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: DEFAULT_HEADERS,
      signal,
    })

    if (!res.ok) {
      if (res.status !== 404) logFailure(path, `HTTP ${res.status}`)
      return null
    }

    return (await res.json()) as T
  } catch (e) {
    // 사용자가 입력을 이어가며 이전 요청이 취소된 것은 장애가 아니다.
    if (e instanceof DOMException && e.name === 'AbortError') return null
    logFailure(path, e instanceof Error ? e.message : String(e))
    return null
  }
}
