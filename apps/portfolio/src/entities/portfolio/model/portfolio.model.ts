import type { ApiOkJson, ENDPOINTS } from '@hyunwoo/shared/api'

/**
 * 응답 타입을 손으로 선언하지 않고 api-server의 OpenAPI 스펙에서 생성한 타입을 쓴다.
 * 백엔드 DTO가 바뀌면 여기 타입이 바뀌고 참조부에서 타입 에러가 난다.
 *
 * 이 도메인은 i18n 구조라 **조회 라우트마다 shape이 다르다.** 목록 조회는 요청
 * locale의 번역을 평탄화해서 주고, 단건 조회와 CRUD는 Prisma 레코드를 그대로 준다
 * (`translations` 배열이 실린다). 여기서 쓰는 것은 전부 목록 계열이다.
 *
 * 수동 선언이던 시절 실제 응답과 어긋난 부분:
 *   Work.sortOrder      →  목록 응답에 없다(레코드 조회에만 있다)
 *   Work.gradientColors →  목록에서는 항상 있는데 `| null`로 선언
 *   SkillItem.id        →  응답에 실리는데 선언 없음
 *   Profile.imageUrl,
 *   Profile.iconUrl     →  실제는 `string | null`인데 `string`으로 선언
 */

export type WorkType = 'business' | 'personal'

export type WorksResponse = ApiOkJson<typeof ENDPOINTS.portfolio.works, 'get'>
export type Work = WorksResponse[number]

export type SkillsResponse = ApiOkJson<typeof ENDPOINTS.portfolio.skills, 'get'>
export type SkillGroup = SkillsResponse[number]
export type SkillItem = SkillGroup['items'][number]

export type EducationResponse = ApiOkJson<typeof ENDPOINTS.portfolio.education, 'get'>
export type Education = EducationResponse[number]

export type ProfileResponse = ApiOkJson<typeof ENDPOINTS.portfolio.profile, 'get'>
export type SocialLink = ProfileResponse['socialLinks'][number]

export type ExperiencesResponse = ApiOkJson<typeof ENDPOINTS.portfolio.experiences, 'get'>
export type Experience = ExperiencesResponse[number]

export type ProjectsResponse = ApiOkJson<typeof ENDPOINTS.portfolio.projects, 'get'>
export type Project = ProjectsResponse[number]
