'use client'

import { useSearchStore } from './search.store'

interface OpenSearchButtonProps {
  children: React.ReactNode
  className?: string
}

/**
 * 검색 오버레이를 여는 버튼.
 *
 * `entities/category` 의 태그 클라우드가 이 동작을 필요로 하는데, entities 가
 * features 를 import 하면 FSD 레이어 방향(위 -> 아래)을 거스른다. 그래서 버튼만
 * 이쪽에 두고, 둘을 아는 `widgets/sidebar` 가 조합해서 내려보낸다.
 */
export function OpenSearchButton({ children, className }: OpenSearchButtonProps) {
  const openSearch = useSearchStore(state => state.open)

  return (
    <button type="button" onClick={openSearch} className={className}>
      {children}
    </button>
  )
}
