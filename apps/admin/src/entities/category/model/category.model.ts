import type { ApiOkJson, ENDPOINTS } from '@hyunwoo/shared/api'

/**
 * 카테고리 목록 응답의 요소.
 *
 * `id`는 nullable이다. 이 목록은 **발행된 글의 category 값**을 groupBy한 것이라,
 * categories 테이블에 없는 이름이 글에 들어가 있으면 매칭되는 레코드가 없다.
 * 그런 항목은 수정·삭제 대상이 아니므로 호출부가 null을 확인해야 한다.
 */
export type Category = ApiOkJson<typeof ENDPOINTS.blog.categories, 'get'>[number]

export interface CreateCategoryBody {
  name: string
  icon: string
  sortOrder?: number
}
