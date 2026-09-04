import type { ApiOkJson } from '@hyunwoo/shared/api'
import { ENDPOINTS } from '@hyunwoo/shared/api'
import { toast } from '@hyunwoo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/shared/api'
import { queryKeys } from '@/shared/config'
import { getErrorMessage, stripLeadingSlash } from '@/shared/lib'
import type { Category, CreateCategoryBody } from '../model'

/**
 * 수정·삭제는 **id**를 쓴다. 이전에는 카테고리 이름을 경로에 넣어 호출했고,
 * 백엔드가 `ParseIntPipe`로 id를 받으므로 항상 400이었다(hyunwoo-dev #134).
 * 목록 응답에 id가 실리도록 백엔드를 고쳤다(chahyunwoo-api #121).
 */
type CategoryCreated = ApiOkJson<typeof ENDPOINTS.blog.categories, 'post'>
type CategoryUpdated = ApiOkJson<'/api/blog/categories/{id}', 'put'>
type TagList = ApiOkJson<typeof ENDPOINTS.blog.tags, 'get'>

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => adminApi.get(stripLeadingSlash(ENDPOINTS.blog.categories)).json<Category[]>(),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateCategoryBody) =>
      adminApi.post(stripLeadingSlash(ENDPOINTS.blog.categories), { json: body }).json<CategoryCreated>(),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      toast.success(`"${data.name}" 카테고리가 생성되었습니다.`)
    },
    onError: async e => {
      toast.error(await getErrorMessage(e))
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: { id: number } & Partial<CreateCategoryBody>) =>
      adminApi.put(stripLeadingSlash(ENDPOINTS.blog.categoryById(id)), { json: body }).json<CategoryUpdated>(),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      toast.success(`"${data.name}" 카테고리가 수정되었습니다.`)
    },
    onError: async e => {
      toast.error(await getErrorMessage(e))
    },
  })
}

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: () => adminApi.get(stripLeadingSlash(ENDPOINTS.blog.tags)).json<TagList>(),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminApi.delete(stripLeadingSlash(ENDPOINTS.blog.categoryById(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      toast.success('카테고리가 삭제되었습니다.')
    },
    onError: async e => {
      toast.error(await getErrorMessage(e))
    },
  })
}
