import type { ApiOkJson } from '@hyunwoo/shared/api'
import { ENDPOINTS } from '@hyunwoo/shared/api'
import { adminApi } from '@/shared/api'
import { LOGIN_PATH } from '@/shared/config'
import { stripLeadingSlash } from '@/shared/lib'
import { setAuthenticated } from '../model/auth.store'

/**
 * 경로는 `ENDPOINTS`에서, 응답 타입은 스펙에서 가져온다.
 *
 * **토큰은 응답 본문이 아니라 쿠키로 온다.** 서버가 HttpOnly 쿠키에 실으므로
 * 본문에는 확인용 메시지만 있다 — 여기서 토큰을 꺼내려 하면 안 된다.
 */

/**
 * 로그인 응답은 두 가지다(스펙상 oneOf):
 *   2FA 꺼짐 → `{ message }`, 쿠키가 설정된다
 *   2FA 켜짐 → `{ requiresTwoFactor, twoFactorToken }`, 쿠키 없음
 *
 * 생성 타입은 이 oneOf를 union으로 준다. 아래에서 `'requiresTwoFactor' in data`로 좁힌다.
 */
type LoginResponse = ApiOkJson<typeof ENDPOINTS.auth.login, 'post'>

export interface TwoFactorRequired {
  requiresTwoFactor: true
  twoFactorToken: string
}

export async function login(username: string, password: string): Promise<TwoFactorRequired | null> {
  const data = await adminApi
    .post(stripLeadingSlash(ENDPOINTS.auth.login), { json: { username, password } })
    .json<LoginResponse>()

  if ('requiresTwoFactor' in data && data.requiresTwoFactor) {
    return { requiresTwoFactor: true, twoFactorToken: data.twoFactorToken }
  }

  setAuthenticated(true)
  return null
}

export async function verifyTwoFactor(twoFactorToken: string, code: string) {
  await adminApi.post(stripLeadingSlash(ENDPOINTS.auth.twoFactorVerify), { json: { twoFactorToken, code } })
  setAuthenticated(true)
}

export type TwoFactorSetupResponse = ApiOkJson<typeof ENDPOINTS.auth.twoFactorSetup, 'post'>
export type TwoFactorStatusResponse = ApiOkJson<typeof ENDPOINTS.auth.twoFactorStatus, 'get'>
type PreviewTokenResponse = ApiOkJson<typeof ENDPOINTS.auth.previewToken, 'post'>

export async function getTwoFactorStatus(): Promise<TwoFactorStatusResponse> {
  return adminApi.get(stripLeadingSlash(ENDPOINTS.auth.twoFactorStatus)).json<TwoFactorStatusResponse>()
}

export async function setupTwoFactor(): Promise<TwoFactorSetupResponse> {
  return adminApi.post(stripLeadingSlash(ENDPOINTS.auth.twoFactorSetup)).json<TwoFactorSetupResponse>()
}

export async function enableTwoFactor(code: string) {
  await adminApi.post(stripLeadingSlash(ENDPOINTS.auth.twoFactorEnable), { json: { code } })
}

export async function disableTwoFactor(code: string) {
  await adminApi.post(stripLeadingSlash(ENDPOINTS.auth.twoFactorDisable), { json: { code } })
}

export async function refreshSession() {
  try {
    await adminApi.post(stripLeadingSlash(ENDPOINTS.auth.refresh))
    setAuthenticated(true)
    return true
  } catch {
    setAuthenticated(false)
    return false
  }
}

export async function extendSession() {
  try {
    await adminApi.post(stripLeadingSlash(ENDPOINTS.auth.sessionExtend))
  } catch {
    // 세션 연장 실패는 무시
  }
}

export async function logout() {
  try {
    await adminApi.post(stripLeadingSlash(ENDPOINTS.auth.logout))
  } catch {
    // 로그아웃 API 실패해도 리다이렉트
  } finally {
    setAuthenticated(false)
    window.location.href = LOGIN_PATH
  }
}

/**
 * 프리뷰 토큰을 발급받는다.
 *
 * **`slug` 는 필수다.** 서버가 토큰을 그 글에 묶어 두므로, 토큰이 유출돼도
 * 열람 범위가 해당 글 하나로 제한된다. 예전에는 slug 없이 발급해 토큰 하나로
 * 모든 비공개 글을 열 수 있었다.
 */
export async function getPreviewToken(slug: string): Promise<string | null> {
  try {
    const data = await adminApi
      .post(stripLeadingSlash(ENDPOINTS.auth.previewToken), { json: { slug } })
      .json<PreviewTokenResponse>()
    return data.token
  } catch {
    return null
  }
}
