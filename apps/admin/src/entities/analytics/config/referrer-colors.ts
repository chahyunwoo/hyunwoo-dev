import type { ReferrerCategory } from '../model'

export const REFERRER_CATEGORY_COLORS: Record<ReferrerCategory, string> = {
  direct: '#6b7280',
  search: '#3b82f6',
  social: '#8b5cf6',
  other: '#f97316',
}

export const REFERRER_CATEGORY_LABELS: Record<ReferrerCategory, string> = {
  direct: '직접 방문',
  search: '검색',
  social: '소셜',
  other: '기타',
}
