import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * 401 동시 발생 시 토큰 갱신이 **한 번만** 일어나고, 대기자들이 모두 그 결과를
 * 받는지 검사한다.
 *
 * 서버의 리프레시 토큰은 일회용이라(조회 즉시 삭제 후 재발급) 동시에 두 번
 * 갱신하면 한쪽이 무효가 된다.
 *
 * ky를 목으로 갈아끼워 401 → 갱신 → 재시도 흐름을 실제로 태운다.
 * 헬퍼만 직접 부르면 afterResponse 훅에 배선됐는지를 못 본다.
 *
 * **이 테스트가 덮지 못하는 것(정직하게 남긴다):** 고친 경합 자체 —
 * 대기자가 `if (isRefreshing)`을 통과한 뒤, `await refreshPromise`에 도달하기
 * 전에 선행이 `refreshPromise = null`로 비워 `await null`이 되는 구간 — 은
 * 여기서 재현하지 못했다. 옛 구현을 되돌려 넣어도 아래 3건이 전부 통과한다.
 * 그 경합은 순수 로직으로는 재현된다(옛 구현: 2건 중 1건이 "Session expired"로
 * 실패). 훅을 통해 그 시점을 강제하려면 모듈 내부 상태를 조작해야 해서,
 * 그렇게까지 하면 구현 세부에 묶인 테스트가 된다.
 * 아래 3건은 "갱신은 한 번만", "대기자 전원이 재시도된다"는 관측 가능한
 * 불변식을 고정하는 데까지만 유효하다.
 */

const hoisted = vi.hoisted(() => {
  const refreshCalls: string[] = []
  let refreshResolvers: Array<(v: unknown) => void> = []

  const kyFn = vi.fn(async () => ({ status: 200, retried: true }))
  const post = vi.fn(async (url: string) => {
    refreshCalls.push(url)
    // 갱신을 즉시 끝내지 않고 테스트가 시점을 제어한다 — 즉시 resolve하면
    // 두 번째 요청이 도착하기 전에 상태가 정리돼 경합이 재현되지 않는다.
    await new Promise(resolve => {
      refreshResolvers.push(resolve)
    })
    return { status: 200 }
  })

  return {
    refreshCalls,
    getResolvers: () => refreshResolvers,
    resetResolvers: () => {
      refreshResolvers = []
    },
    kyFn,
    post,
  }
})

vi.mock('ky', () => {
  const create = vi.fn((config: Record<string, unknown>) => {
    const instance = Object.assign(hoisted.kyFn, config)
    return instance
  })
  return { default: Object.assign(hoisted.kyFn, { create, post: hoisted.post }) }
})

vi.mock('@hyunwoo/shared/config', () => ({
  API_URL: 'https://api.example.test',
  API_KEY: 'k',
}))

vi.mock('@/shared/config', () => ({ LOGIN_PATH: '/login' }))

describe('adminApi 토큰 갱신 경합', () => {
  beforeEach(() => {
    vi.resetModules()
    hoisted.refreshCalls.length = 0
    hoisted.resetResolvers()
    hoisted.kyFn.mockClear()
    hoisted.post.mockClear()
  })

  async function loadHook() {
    const kyModule = (await import('ky')).default as unknown as {
      create: ReturnType<typeof vi.fn>
    }
    await import('./client')
    const config = kyModule.create.mock.calls[0][0] as {
      hooks: { afterResponse: Array<(req: unknown, opts: unknown, res: unknown) => Promise<unknown>> }
    }
    return config.hooks.afterResponse[0]
  }

  it('401이 아니면 그대로 통과시킨다', async () => {
    const hook = await loadHook()
    const response = { status: 200 }

    await expect(hook({}, {}, response)).resolves.toBe(response)
    expect(hoisted.refreshCalls).toHaveLength(0)
  })

  it('동시에 401 세 개가 와도 갱신은 한 번만 수행한다', async () => {
    const hook = await loadHook()

    const pending = [
      hook({ url: 'a' }, {}, { status: 401 }),
      hook({ url: 'b' }, {}, { status: 401 }),
      hook({ url: 'c' }, {}, { status: 401 }),
    ]

    // 갱신 요청이 들어올 때까지 기다린다.
    await vi.waitFor(() => expect(hoisted.getResolvers()).toHaveLength(1))
    for (const resolve of hoisted.getResolvers()) resolve(undefined)

    await Promise.all(pending)

    // 일회용 토큰이라 두 번 갱신하면 한쪽이 무효가 된다.
    expect(hoisted.refreshCalls).toHaveLength(1)
  })

  it('대기하던 요청도 모두 재시도된다 — 갱신 성공인데 일부만 실패하면 안 된다', async () => {
    const hook = await loadHook()

    const pending = [
      hook({ url: 'a' }, {}, { status: 401 }),
      hook({ url: 'b' }, {}, { status: 401 }),
      hook({ url: 'c' }, {}, { status: 401 }),
    ]

    await vi.waitFor(() => expect(hoisted.getResolvers()).toHaveLength(1))
    for (const resolve of hoisted.getResolvers()) resolve(undefined)

    const results = await Promise.allSettled(pending)

    // 하나라도 rejected면 "갱신은 됐는데 그 요청만 죽는" 예전 버그다.
    expect(results.every(r => r.status === 'fulfilled')).toBe(true)
    expect(hoisted.kyFn).toHaveBeenCalledTimes(3)
  })
})
