/**
 * 환경변수 값은 반드시 trim한다.
 *
 * 왜 필요한가: Vercel 대시보드에서 값을 붙여넣을 때 끝에 개행이 섞이는 일이 실제로 있었다.
 * Next.js는 `NEXT_PUBLIC_*`를 빌드 시점에 번들에 그대로 박으므로, 개행이 붙은 채로
 * 브라우저까지 간다. 그 결과 API 키가 64자가 아니라 65자로 전송됐고,
 * 서버의 `ApiKeyGuard`가 `apiKey.length !== expectedKey.length`로 먼저 거르기 때문에
 * **모든 공개 API 요청이 401**이 됐다.
 *
 * 실측 피해(2026-09-04 확인): 블로그 방문 통계가 159일간(2026-03-28 이후) 한 건도
 * 기록되지 않았고, 포트폴리오 문의 폼도 같은 기간 전송이 전부 실패했다.
 * 두 호출 모두 실패를 조용히 삼키는 구조라 아무도 알아채지 못했다.
 *
 * 근본 원인은 환경변수 값 자체이므로 Vercel에서도 값을 고쳐야 하지만,
 * 같은 실수가 반복돼도 서비스가 죽지 않도록 여기서 방어한다.
 */
const env = (value: string | undefined, fallback = ''): string => (value ?? fallback).trim()

export const API_URL = env(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:4000')
export const API_KEY = env(process.env.NEXT_PUBLIC_API_KEY)

export const DEFAULT_REVALIDATE = false

export const DEFAULT_HEADERS = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
} as const
