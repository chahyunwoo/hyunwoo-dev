import type { ApiOkJson } from '@hyunwoo/shared/api'
import { ENDPOINTS } from '@hyunwoo/shared/api'
import { toast } from '@hyunwoo/ui'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { adminApi, uploadFile } from '@/shared/api'
import { queryKeys } from '@/shared/config'
import { getErrorMessage, stripLeadingSlash } from '@/shared/lib'
import type { CreatePostBody, PostListParams, UpdatePostBody } from '../model'
import { postDetailOptions, postListOptions } from './post.options'

/**
 * 생성·수정 응답도 스펙에서 가져온다. 목록·상세와 같은 shape(PostDetailDto)이지만
 * 경로가 다르므로 각각 선언한다 — 백엔드가 한쪽만 바꿔도 여기서 갈린다.
 */
type PostCreateResponse = ApiOkJson<typeof ENDPOINTS.blog.posts, 'post'>
type PostUpdateResponse = ApiOkJson<'/api/blog/posts/{slug}', 'put'>

export function usePostList(params?: PostListParams) {
  return useSuspenseQuery(postListOptions(params))
}

export function usePostDetail(slug: string) {
  return useSuspenseQuery(postDetailOptions(slug))
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreatePostBody) =>
      adminApi.post(stripLeadingSlash(ENDPOINTS.blog.posts), { json: body }).json<PostCreateResponse>(),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      toast.success(`"${data.title}" 포스트가 생성되었습니다.`)
    },
    onError: async e => {
      toast.error(await getErrorMessage(e))
    },
  })
}

export function useUpdatePost(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdatePostBody) =>
      adminApi.put(stripLeadingSlash(ENDPOINTS.blog.postBySlug(slug)), { json: body }).json<PostUpdateResponse>(),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(slug) })
      toast.success(`"${data.title}" 포스트가 수정되었습니다.`)
    },
    onError: async e => {
      toast.error(await getErrorMessage(e))
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => adminApi.delete(stripLeadingSlash(ENDPOINTS.blog.postBySlug(slug))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      toast.success('포스트가 삭제되었습니다.')
    },
    onError: async e => {
      toast.error(await getErrorMessage(e))
    },
  })
}

export function useUploadThumbnail(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('thumbnail', file)
      return uploadFile<{ thumbnailUrl: string }>(`api/blog/posts/${slug}/thumbnail`, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(slug) })
      toast.success('썸네일이 업로드되었습니다.')
    },
    onError: async e => {
      toast.error(await getErrorMessage(e))
    },
  })
}
