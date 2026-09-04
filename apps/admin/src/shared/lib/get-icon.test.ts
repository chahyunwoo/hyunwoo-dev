import { getIcon, ICON_LIST } from '@hyunwoo/ui'
import * as icons from 'lucide-react'
import { describe, expect, it } from 'vitest'

describe('getIcon', () => {
  it('ICON_LIST에 있는 이름은 해당 아이콘 컴포넌트를 돌려준다', () => {
    expect(getIcon('Monitor')).toBe(icons.Monitor)
    expect(getIcon('Server')).toBe(icons.Server)
  })

  it('ICON_LIST 전체가 실제로 lucide-react에 존재한다', () => {
    const missing = ICON_LIST.filter(name => (icons as unknown as Record<string, unknown>)[name] === undefined)
    expect(missing).toEqual([])
  })

  /**
   * lucide-react는 5286개를 내보내는데 그중 셋은 아이콘이 아니다.
   * 이름을 그대로 인덱싱하면 이것들이 반환되어 렌더 시점에 깨진다.
   *
   *   Icon             — iconNode를 필수로 받는 제네릭 컴포넌트
   *   createLucideIcon — 함수. React가 컴포넌트로 호출한다
   *   icons            — 일반 객체. 렌더하면 크래시한다
   *
   * 이름은 DB에 저장된 값에서 오므로(categories.icon 등) 목록 밖 값이 올 수 있다.
   */
  it.each(['Icon', 'createLucideIcon', 'icons'])('아이콘이 아닌 export "%s"를 반환하지 않는다', name => {
    expect(getIcon(name)).toBe(icons.Folder)
  })

  it('ICON_LIST에 없는 이름은 fallback으로 보낸다', () => {
    expect(getIcon('존재하지않는아이콘')).toBe(icons.Folder)
    expect(getIcon('')).toBe(icons.Folder)
  })

  it('fallback을 지정할 수 있다', () => {
    expect(getIcon('없는이름', icons.Star)).toBe(icons.Star)
  })

  /**
   * blog 의 카테고리는 `icon` 이 nullable 이라 `undefined` 가 그대로 들어온다.
   * 예전에는 blog 가 자체 getIcon 을 따로 두고 있었고, 그쪽은 ICON_LIST 검증
   * 없이 네임스페이스를 인덱싱해 위의 비아이콘 3종을 그대로 돌려줬다(#138/#124).
   */
  it('name 이 undefined 면 fallback 으로 보낸다', () => {
    expect(getIcon(undefined)).toBe(icons.Folder)
    expect(getIcon(undefined, icons.Star)).toBe(icons.Star)
  })
})
