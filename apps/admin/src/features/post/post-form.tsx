import { zodResolver } from '@hookform/resolvers/zod'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  toast,
} from '@hyunwoo/ui'
import Editor, { type Monaco } from '@monaco-editor/react'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  Code,
  ExternalLink,
  Highlighter,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  Upload,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { getPreviewToken } from '@/entities/auth'
import { useCategories, useTags } from '@/entities/category'
import { uploadFile } from '@/shared/api'
import { BLOG_URL } from '@/shared/config'
import { monokaiWinterNight } from '@/shared/lib'
import { type PostFormValues, postSchema } from '@/shared/schemas'
import { AdminInput, AdminLabel, DatePicker, FileInput, TagsInput } from '@/shared/ui'

interface PostFormProps {
  defaultValues?: Partial<PostFormValues>
  onSubmit: (values: PostFormValues) => void
  isPending: boolean
  mode: 'create' | 'edit'
  slug?: string
  renderCategoryModal: (props: {
    opened: boolean
    onClose: () => void
    onSelect: (category: string) => void
  }) => ReactNode
}

export function PostForm({ defaultValues, onSubmit, isPending, mode, slug, renderCategoryModal }: PostFormProps) {
  const navigate = useNavigate()
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [thumbnailToken, setThumbnailToken] = useState('')
  const [previewToken, setPreviewToken] = useState<string | null>(null)

  // 토큰은 slug 에 묶여 발급되므로 slug 가 정해진 뒤에만 받는다.
  // (프리뷰 버튼 자체가 mode === 'edit' && slug 일 때만 노출된다)
  useEffect(() => {
    if (!slug) {
      setPreviewToken(null)
      return
    }
    let cancelled = false
    getPreviewToken(slug).then(token => {
      if (!cancelled) setPreviewToken(token)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  const [categoryModalOpened, setCategoryModalOpened] = useState(false)

  const { data: categoriesData } = useCategories()
  const { data: tagsData } = useTags()

  const categoryOptions = categoriesData?.map(c => c.category) ?? []
  const tagOptions = tagsData?.tags.map(t => t.name) ?? []

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      category: '',
      tags: [],
      thumbnailUrl: '',
      published: false,
      publishedAt: '',
      ...defaultValues,
    },
  })

  const thumbnailUrl = watch('thumbnailUrl')

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      const result = await uploadFile<{ url: string }>('api/blog/images', formData)
      return result.url
    } catch {
      toast.error('10MB 이하 이미지만 가능합니다.')
      return null
    }
  }

  const openPreview = () => {
    if (!slug || !previewToken) return
    window.open(`${BLOG_URL}/preview/${slug}?token=${previewToken}`, '_blank')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="flex flex-col gap-6">
            <div>
              <AdminLabel htmlFor="title">제목</AdminLabel>
              <AdminInput
                id="title"
                placeholder="포스트 제목을 입력하세요"
                className="text-lg font-semibold h-11"
                {...register('title')}
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <AdminLabel htmlFor="description">설명</AdminLabel>
              <AdminInput
                id="description"
                placeholder="미입력 시 본문에서 자동 추출됩니다"
                className="h-11"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div>
              {errors.content && <p className="text-xs text-destructive mb-1">{errors.content.message}</p>}
              <div className="rounded-md overflow-hidden border border-border">
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <Editor
                      height="calc(100vh - 400px)"
                      defaultLanguage="markdown"
                      value={field.value}
                      onChange={value => field.onChange(value ?? '')}
                      beforeMount={(monaco: Monaco) => {
                        monaco.editor.defineTheme('monokai-winter-night', monokaiWinterNight)
                      }}
                      theme="monokai-winter-night"
                      onMount={editor => {
                        const dom = editor.getDomNode()
                        if (!dom) return

                        const insertImage = async (file: File) => {
                          const url = await handleImageUpload(file)
                          if (!url) return
                          const position = editor.getPosition()
                          if (!position) return
                          const insertText = `\n<MdxImage src="${url}" alt="" caption="" />\n`
                          editor.executeEdits('', [
                            {
                              range: {
                                startLineNumber: position.lineNumber,
                                startColumn: position.column,
                                endLineNumber: position.lineNumber,
                                endColumn: position.column,
                              },
                              text: insertText,
                            },
                          ])
                          const newLine = position.lineNumber + 1
                          editor.setPosition({ lineNumber: newLine, column: 1 })
                          editor.revealLineInCenter(newLine)
                          editor.focus()
                        }

                        dom.addEventListener('paste', async (e: Event) => {
                          const ce = e as ClipboardEvent
                          const file = ce.clipboardData?.files[0]
                          if (!file?.type.startsWith('image/')) return
                          ce.preventDefault()
                          ce.stopPropagation()
                          insertImage(file)
                        })
                        dom.addEventListener(
                          'dragover',
                          (e: Event) => {
                            e.preventDefault()
                            e.stopPropagation()
                          },
                          true,
                        )
                        dom.addEventListener(
                          'drop',
                          async (e: Event) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const de = e as DragEvent
                            const file = de.dataTransfer?.files[0]
                            if (!file?.type.startsWith('image/')) return
                            insertImage(file)
                          },
                          true,
                        )
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: 'all',
                        bracketPairColorization: { enabled: true },
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        roundedSelection: true,
                        cursorSmoothCaretAnimation: 'on',
                        dropIntoEditor: { enabled: false },
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">설정</span>
                  <Controller
                    name="published"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{field.value ? '발행' : '임시저장'}</span>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">카테고리</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setCategoryModalOpened(true)}
                      >
                        <Plus className="size-3" />
                        관리
                      </Button>
                    </div>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map(cat => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                    {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
                  </div>

                  {renderCategoryModal({
                    opened: categoryModalOpened,
                    onClose: () => setCategoryModalOpened(false),
                    onSelect: (v: string) => setValue('category', v),
                  })}

                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TagsInput
                        label="태그"
                        placeholder="Enter로 추가"
                        data={tagOptions}
                        error={errors.tags?.message}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <Controller
                    name="publishedAt"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <AdminLabel>발행일</AdminLabel>
                        <DatePicker
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="미입력 시 발행 시점 자동"
                        />
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <span className="text-sm font-semibold block mb-3">썸네일</span>
                {thumbnailUrl ? (
                  <div className="flex flex-col gap-2">
                    <img
                      src={thumbnailToken ? `${thumbnailUrl}?v=${thumbnailToken}` : thumbnailUrl}
                      alt="썸네일"
                      className="rounded-md h-[180px] w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setValue('thumbnailUrl', '')}
                    >
                      제거
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <FileInput
                      placeholder={thumbnailUploading ? '업로드 중...' : '이미지를 선택하면 자동 업로드됩니다'}
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      leftSection={thumbnailUploading ? <Upload size={16} /> : <ImageIcon size={16} />}
                      disabled={thumbnailUploading}
                      onChange={async file => {
                        if (!file) return
                        setThumbnailUploading(true)
                        const url = await handleImageUpload(file)
                        if (url) {
                          setValue('thumbnailUrl', url)
                          setThumbnailToken(Date.now().toString())
                          toast.success('썸네일 업로드 완료')
                        }
                        setThumbnailUploading(false)
                      }}
                    />
                    <span className="text-xs text-muted-foreground">1200x630 권장 (OG 이미지), 10MB 제한</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <span className="text-sm font-semibold block mb-3">MDX 컴포넌트</span>
                <Accordion type="single" collapsible>
                  <AccordionItem value="callout">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-6 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <Info size={14} />
                        </div>
                        <span className="text-sm">Callout</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground mb-2">
                        type: tip | info | warning | error | success | default
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Callout type="tip">팁 내용</Callout>`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Callout type="info">정보</Callout>`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Callout type="warning">경고</Callout>`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Callout type="error">에러</Callout>`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Callout type="success">성공</Callout>`}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="highlight">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-6 rounded bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                          <Highlighter size={14} />
                        </div>
                        <span className="text-sm">Highlight</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground mb-2">
                        color: fuchsia (기본) | blue | green | yellow | red
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Highlight>기본 강조 (fuchsia)</Highlight>`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Highlight color="blue">파란색</Highlight>`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Highlight color="green">초록색</Highlight>`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Highlight color="yellow">노란색</Highlight>`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Highlight color="red">빨간색</Highlight>`}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="image">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-6 rounded bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          <ImageIcon size={14} />
                        </div>
                        <span className="text-sm">MdxImage</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground mb-2">
                        src (필수), alt, caption, width, height, priority
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<MdxImage src="https://..." alt="설명" />`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<MdxImage\n  src="https://..."\n  alt="설명"\n  caption="이미지 캡션"\n/>`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<MdxImage\n  src="https://..."\n  alt="설명"\n  width={800}\n  height={400}\n  priority\n/>`}</pre>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        에디터에 이미지를 드래그/붙여넣기하면 자동 업로드됩니다.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="link">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-6 rounded bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                          <ExternalLink size={14} />
                        </div>
                        <span className="text-sm">MdxLink</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground mb-2">외부 링크 자동 감지 (새 탭 + 아이콘)</p>
                      <div className="flex flex-col gap-1.5">
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`[링크 텍스트](https://example.com)`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`[내부 링크](/blog/post-slug)`}</pre>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        마크다운 링크 문법 그대로 사용. 외부 URL은 자동으로 새 탭 + 아이콘 표시.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="code">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-6 rounded bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                          <Code size={14} />
                        </div>
                        <span className="text-sm">코드 블록</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground mb-2">title: 파일명 표시, 라인 하이라이팅 지원</p>
                      <div className="flex flex-col gap-1.5">
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`\`\`\`ts title="파일명.ts"\nconst x = 1;\n\`\`\``}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`\`\`\`tsx title="Component.tsx" {3-5}\nimport { useState } from 'react'\n\nfunction App() {\n  const [count, setCount] = useState(0)\n  return <div>{count}</div>\n}\n\`\`\``}</pre>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        지원 언어: ts, tsx, js, jsx, css, html, json, bash, yaml, python, go, rust, sql 등
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="icon">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-6 rounded bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          <AlertCircle size={14} />
                        </div>
                        <span className="text-sm">Icon</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground mb-2">
                        name (필수), size (기본 24), color, className
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Icon name="AlertCircle" />`}</pre>
                        <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{`<Icon name="AlertCircle" size={16} color="red" />`}</pre>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">lucide-react 아이콘 이름 사용</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex items-center justify-end gap-2">
        {mode === 'edit' && slug && (
          <Button type="button" variant="secondary" onClick={openPreview} disabled={!previewToken}>
            <ExternalLink className="size-3.5" />
            프리뷰
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => navigate({ to: '/posts' })}>
          취소
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {mode === 'create' ? '생성' : '저장'}
        </Button>
      </div>
    </form>
  )
}
