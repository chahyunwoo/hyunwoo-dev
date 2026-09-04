import { API_KEY, API_URL } from '@hyunwoo/shared/config'
import ky from 'ky'
import { LOGIN_PATH } from '@/shared/config'

/**
 * 진행 중인 갱신 요청. 완료돼도 즉시 비우지 않는다.
 *
 * 서버의 리프레시 토큰은 **일회용**이다(auth.service의 refresh가 트랜잭션 안에서
 * 조회 즉시 삭제하고 새로 발급한다). 그래서 동시에 두 번 갱신하면 한쪽이 무효가 된다.
 *
 * 예전 구현은 `isRefreshing` 불리언과 프라미스를 따로 들고, 갱신이 끝나면
 * `refreshPromise = null`로 비웠다. 그 사이에 경합 구간이 있었다:
 * 대기자가 `if (isRefreshing)`을 통과한 뒤 `await refreshPromise`에 도달하기 전에
 * 선행 요청이 null로 비우면, 대기자는 `await null` → falsy → "Session expired"를
 * 던진다. **갱신은 성공했는데 그 요청만 실패한다.**
 *
 * 증상: 30분 방치 후 대시보드에 들어가면 쿼리 여러 개가 동시에 401을 받고,
 * 그중 타이밍이 맞은 것들만 에러가 난다. 새로고침하면 정상이라 재현이 어렵다.
 *
 * 그래서 상태를 프라미스 하나로 합치고, 대기자는 그 프라미스를 그대로 기다린다.
 * 다음 갱신이 필요할 때 새 프라미스로 교체된다.
 */
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  try {
    await ky.post(`${API_URL}/api/auth/refresh`, {
      credentials: 'include',
      headers: { 'x-api-key': API_KEY },
    })
    return true
  } catch {
    return false
  }
}

/**
 * 갱신을 한 번만 수행하고, 동시에 들어온 요청은 같은 결과를 공유한다.
 *
 * 실패한 결과를 남겨두면 이후 요청이 영원히 실패한 값을 재사용하므로,
 * 완료 후에는 **자기 자신일 때만** 비운다 — 그 사이 다른 갱신이 시작됐다면
 * 그것을 지우면 안 된다.
 */
function refreshOnce(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  const current = tryRefresh().finally(() => {
    if (refreshPromise === current) refreshPromise = null
  })
  refreshPromise = current
  return current
}

export const adminApi = ky.create({
  prefixUrl: API_URL,
  credentials: 'include',
  headers: {
    'x-api-key': API_KEY,
  },
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (response.status !== 401) return response

        // 동시에 401을 받은 요청들이 갱신을 한 번만 수행하고 결과를 공유한다.
        const success = await refreshOnce()

        if (success) {
          return ky(request, { ...options, credentials: 'include' })
        }

        window.location.href = LOGIN_PATH
        throw new Error('Session expired')
      },
    ],
  },
})

export async function uploadFile<T>(path: string, formData: FormData): Promise<T> {
  return adminApi.post(path, { body: formData }).json<T>()
}
