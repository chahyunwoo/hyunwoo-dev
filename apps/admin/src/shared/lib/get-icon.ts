import type { LucideIcon } from 'lucide-react'
import * as icons from 'lucide-react'

// lucide-react가 내보내는 `Icon`(iconNode를 필수로 받는 제네릭 컴포넌트)이 LucideIcon과
// 호환되지 않아 직접 단언이 막힌다. unknown을 거치는 건 TS 컴파일러가 제시하는 방식이고
// 런타임 동작은 그대로다. (name으로 'Icon'이 들어오면 iconNode 없이 렌더되는 잠재 문제는
// 이 함수가 생길 때부터 있던 것으로, 여기서 바꾸지 않는다)
export function getIcon(name: string, fallback: LucideIcon = icons.Folder): LucideIcon {
  return (icons as unknown as Record<string, LucideIcon | undefined>)[name] ?? fallback
}
