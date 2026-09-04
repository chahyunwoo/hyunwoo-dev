import type { LucideIcon } from 'lucide-react'
import * as icons from 'lucide-react'
import { ICON_LIST } from './icon-list'

/**
 * lucide-react 네임스페이스에서 아이콘 컴포넌트를 이름으로 찾는다.
 *
 * **이름을 그대로 인덱싱하면 안 된다.** `lucide-react`가 내보내는 5286개 중
 * 아이콘이 아닌 것이 셋 섞여 있다(실측):
 *
 *   - `Icon`             — `iconNode`를 필수 prop으로 받는 제네릭 컴포넌트.
 *                          `iconNode` 없이 렌더되면 깨진다.
 *   - `createLucideIcon` — 함수. React가 컴포넌트로 호출해 오작동한다.
 *   - `icons`            — 일반 객체. 렌더를 시도하면 크래시한다.
 *
 * 아이콘 이름은 DB에 저장된 값(`blog.categories.icon`)에서 온다. 지금 어드민
 * UI는 `ICON_LIST`에서 고르게 되어 있지만, 과거 데이터나 API를 직접 호출해
 * 넣은 값은 그 목록 밖일 수 있다.
 *
 * 그래서 네임스페이스 조회 전에 `ICON_LIST`로 거른다. 이 목록이 지원한다고
 * 선언한 아이콘의 단일 출처이므로, 목록 밖 이름은 fallback으로 보낸다.
 *
 * `name`이 `undefined`일 수 있다 — 카테고리의 `icon`은 nullable이다.
 */
const ALLOWED = new Set<string>(ICON_LIST)

export function getIcon(name: string | undefined, fallback: LucideIcon = icons.Folder): LucideIcon {
  if (!name || !ALLOWED.has(name)) return fallback

  // ICON_LIST를 통과했으므로 실제 아이콘 컴포넌트다. lucide-react의 `Icon`이
  // LucideIcon과 호환되지 않아 네임스페이스 전체에 직접 단언이 막히므로 unknown을 거친다.
  return (icons as unknown as Record<string, LucideIcon | undefined>)[name] ?? fallback
}
