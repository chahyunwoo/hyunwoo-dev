import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `NEXT_PUBLIC_*` 값에 개행이 섞여도 API 호출이 죽지 않는지 검사한다.
 *
 * 이 테스트가 있는 이유(실측): Vercel 환경변수 값 끝에 `\n`이 들어가 있었고,
 * Next.js가 그 값을 그대로 번들에 박아 브라우저가 65자 키를 전송했다.
 * 서버 `ApiKeyGuard`는 길이부터 비교하므로 전부 401이 됐고,
 * 블로그 방문 통계 159일치와 포트폴리오 문의가 통째로 유실됐다.
 *
 * 값을 읽는 시점이 **모듈 로드 시점**이라, `resetModules` 후 동적 import로
 * 매번 새로 평가시켜야 한다. 그렇게 하지 않으면 첫 import 결과가 캐시돼
 * 무엇을 넣든 같은 값이 나와 테스트가 아무것도 검사하지 못한다.
 */
describe('api.config 환경변수 정규화', () => {
  const original = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...original }
  })

  async function loadConfig(url?: string, key?: string) {
    if (url === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = url
    if (key === undefined) delete process.env.NEXT_PUBLIC_API_KEY
    else process.env.NEXT_PUBLIC_API_KEY = key
    return await import('@hyunwoo/shared/config')
  }

  it('키 끝의 개행을 제거한다 — 붙어 있으면 서버가 길이 불일치로 401을 낸다', async () => {
    const raw = 'a'.repeat(64)
    const { API_KEY } = await loadConfig('https://api.example.test', `${raw}\n`)

    expect(API_KEY).toBe(raw)
    expect(API_KEY).toHaveLength(64)
  })

  it('URL 끝의 개행을 제거한다 — 붙어 있으면 요청 URL 자체가 깨진다', async () => {
    const { API_URL } = await loadConfig('https://api.example.test\n', 'k')

    expect(API_URL).toBe('https://api.example.test')
    expect(API_URL).not.toMatch(/\s/)
  })

  it('앞뒤 공백과 CRLF도 제거한다', async () => {
    const { API_KEY, API_URL } = await loadConfig('  https://api.example.test\r\n', '  secret\r\n')

    expect(API_URL).toBe('https://api.example.test')
    expect(API_KEY).toBe('secret')
  })

  it('DEFAULT_HEADERS에 실리는 키에도 정규화가 적용된다', async () => {
    const raw = 'b'.repeat(64)
    const { DEFAULT_HEADERS } = await loadConfig('https://api.example.test', `${raw}\n`)

    // 실제로 fetch에 나가는 값은 이쪽이다. API_KEY만 고치고 여기가 빠지면
    // 문의 폼과 pageview는 여전히 401이 난다.
    expect(DEFAULT_HEADERS['x-api-key']).toBe(raw)
  })

  it('미설정 시 기본값을 쓴다', async () => {
    const { API_URL, API_KEY } = await loadConfig(undefined, undefined)

    expect(API_URL).toBe('http://localhost:4000')
    expect(API_KEY).toBe('')
  })
})
