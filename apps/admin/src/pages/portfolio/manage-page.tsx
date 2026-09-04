import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  getIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@hyunwoo/ui'
import { Image as ImageIcon, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type {
  CreateSkillBody,
  EducationDetail,
  EducationTranslation,
  ProfileTranslation,
  SocialLink,
  UpdateProfileBody,
} from '@/entities/portfolio'
import {
  useCreateEducation,
  useCreateLocale,
  useCreateSkill,
  useDeleteEducation,
  useDeleteLocale,
  useDeleteSkill,
  useEducation,
  useLocales,
  useProfileAll,
  useSkills,
  useUpdateEducation,
  useUpdateProfile,
  useUpdateSkill,
  useUploadProfileIcon,
  useUploadProfileImage,
} from '@/entities/portfolio'
import { TwoFactorSetup } from '@/pages/settings/two-factor-setup'
import { adminApi } from '@/shared/api'
import type { LocaleCode } from '@/shared/config'
import { LOCALE_TABS } from '@/shared/config'
import { useTranslationForm } from '@/shared/hooks'
import { AdminInput, AdminLabel, AdminTextarea, FileInput, LocaleTabs, useConfirmStore } from '@/shared/ui'

const SOCIAL_ICONS = ['Github', 'Instagram', 'Linkedin', 'Twitter', 'Mail', 'Globe', 'Youtube', 'Facebook'] as const

function SocialIconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const CurrentIcon = getIcon(value)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center size-10 shrink-0 rounded-md border">
        {value ? <CurrentIcon className="size-4" /> : <span className="text-xs text-muted-foreground">?</span>}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 flex-1">
          <SelectValue placeholder="아이콘 선택" />
        </SelectTrigger>
        <SelectContent>
          {SOCIAL_ICONS.map(name => {
            const Icon = getIcon(name)
            return (
              <SelectItem key={name} value={name}>
                <div className="flex items-center gap-2">
                  <Icon className="size-4" />
                  <span>{name}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

export function ManagePage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Portfolio Settings</h2>
      <Accordion type="multiple" defaultValue={['profile']}>
        <AccordionItem value="profile">
          <AccordionTrigger>Profile</AccordionTrigger>
          <AccordionContent className="px-1 pt-4 pb-2">
            <ProfileSection />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="skills">
          <AccordionTrigger>Skills</AccordionTrigger>
          <AccordionContent className="px-1 pt-4 pb-2">
            <SkillsSection />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="education">
          <AccordionTrigger>Education</AccordionTrigger>
          <AccordionContent className="px-1 pt-4 pb-2">
            <EducationSection />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="locales">
          <AccordionTrigger>Locales</AccordionTrigger>
          <AccordionContent className="px-1 pt-4 pb-2">
            <LocalesSection />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <TwoFactorSetup />
    </div>
  )
}

// ─── Profile ───

function ProfileSection() {
  const { data: profile, isLoading } = useProfileAll()
  const updateProfile = useUpdateProfile()
  const uploadImage = useUploadProfileImage()
  const uploadIcon = useUploadProfileIcon()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [imageToken, setImageToken] = useState('')
  const [iconToken, setIconToken] = useState('')
  const keyCounter = useRef(0)
  const [socialLinks, setSocialLinks] = useState<(SocialLink & { _key: number })[]>([])
  const [translations, setTranslations] = useState<ProfileTranslation[]>(
    LOCALE_TABS.map(l => ({ locale: l.code, jobTitle: '', introduction: [] })),
  )
  const [activeLocale, setActiveLocale] = useState<LocaleCode>('ko')

  useEffect(() => {
    if (!profile) return
    setName(profile.name)
    setLocation(profile.location)
    setImageUrl(profile.imageUrl)
    setIconUrl(profile.iconUrl)
    setSocialLinks((profile.socialLinks ?? []).map((link: SocialLink) => ({ ...link, _key: keyCounter.current++ })))
    setTranslations(
      LOCALE_TABS.map(l => {
        const existing = profile.translations?.find(t => t.locale === l.code)
        return existing
          ? { locale: l.code, jobTitle: existing.jobTitle, introduction: existing.introduction }
          : { locale: l.code as LocaleCode, jobTitle: '', introduction: [] }
      }),
    )
  }, [profile])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  const currentTranslation = translations.find(t => t.locale === activeLocale)

  const updateTranslationField = (locale: LocaleCode, field: keyof ProfileTranslation, value: unknown) => {
    setTranslations(prev => prev.map(t => (t.locale === locale ? { ...t, [field]: value } : t)))
  }

  const handleSave = () => {
    const body: UpdateProfileBody = {
      name,
      location,
      imageUrl,
      iconUrl,
      socialLinks: socialLinks.map(({ _key: _, ...rest }) => rest),
      translations,
    }
    updateProfile.mutate(body)
  }

  const addSocialLink = () => {
    setSocialLinks(prev => [...prev, { name: '', href: '', icon: '', _key: keyCounter.current++ }])
  }

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    setSocialLinks(prev => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)))
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AdminLabel htmlFor="profile-name">Name</AdminLabel>
          <AdminInput id="profile-name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <AdminLabel htmlFor="profile-location">Location</AdminLabel>
          <AdminInput id="profile-location" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AdminLabel>Profile Image</AdminLabel>
          {imageUrl ? (
            <div className="flex flex-col gap-2">
              <img
                src={imageToken ? `${imageUrl}?v=${imageToken}` : imageUrl}
                alt="Profile"
                className="size-24 rounded-full object-cover"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => setImageUrl('')}>
                제거
              </Button>
            </div>
          ) : (
            <FileInput
              placeholder="이미지 선택"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              leftSection={<ImageIcon className="size-4" />}
              disabled={uploadImage.isPending}
              onChange={async file => {
                if (!file) return
                const result = await uploadImage.mutateAsync(file)
                setImageUrl(result.url)
                setImageToken(Date.now().toString())
              }}
            />
          )}
        </div>
        <div>
          <AdminLabel>Icon</AdminLabel>
          {iconUrl ? (
            <div className="flex flex-col gap-2">
              <img
                src={iconToken ? `${iconUrl}?v=${iconToken}` : iconUrl}
                alt="Icon"
                className="size-24 rounded-md object-cover"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => setIconUrl('')}>
                제거
              </Button>
            </div>
          ) : (
            <FileInput
              placeholder="아이콘 선택"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              leftSection={<ImageIcon className="size-4" />}
              disabled={uploadIcon.isPending}
              onChange={async file => {
                if (!file) return
                const result = await uploadIcon.mutateAsync(file)
                setIconUrl(result.url)
                setIconToken(Date.now().toString())
              }}
            />
          )}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <AdminLabel>Social Links</AdminLabel>
          <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
            <Plus className="size-3" /> 추가
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {socialLinks.map((link, i) => (
            <div key={link._key} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
              <AdminInput
                placeholder="name"
                value={link.name}
                onChange={e => updateSocialLink(i, 'name', e.target.value)}
              />
              <AdminInput
                placeholder="href"
                value={link.href}
                onChange={e => updateSocialLink(i, 'href', e.target.value)}
              />
              <SocialIconPicker value={link.icon} onChange={v => updateSocialLink(i, 'icon', v)} />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(i)} aria-label="삭제">
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <LocaleTabs activeLocale={activeLocale} onChange={setActiveLocale} />
        {currentTranslation && (
          <div className="flex flex-col gap-5 mt-4">
            <div>
              <AdminLabel>Job Title</AdminLabel>
              <AdminInput
                value={currentTranslation.jobTitle}
                onChange={e => updateTranslationField(activeLocale, 'jobTitle', e.target.value)}
              />
            </div>
            <div>
              <AdminLabel>Introduction (한 줄씩 입력)</AdminLabel>
              <AdminTextarea
                value={currentTranslation.introduction.join('\n')}
                onChange={e => updateTranslationField(activeLocale, 'introduction', e.target.value.split('\n'))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
          저장
        </Button>
      </div>
    </div>
  )
}

// ─── Skills ───

function SkillsSection() {
  const { data: skillGroups, isLoading } = useSkills()
  const createSkill = useCreateSkill()
  const deleteSkill = useDeleteSkill()
  const confirm = useConfirmStore(state => state.confirm)

  const existingCategories = skillGroups?.map(g => g.category) ?? []

  const [showAddForm, setShowAddForm] = useState(false)
  const [newSkill, setNewSkill] = useState<CreateSkillBody>({
    category: '',
    name: '',
    proficiency: 80,
    description: '',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<CreateSkillBody>>({})

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  const handleCreate = () => {
    if (!newSkill.category.trim() || !newSkill.name.trim()) return
    const body: CreateSkillBody = {
      ...newSkill,
      description: newSkill.description?.trim() || undefined,
    }
    createSkill.mutate(body, {
      onSuccess: () => {
        setNewSkill({ category: '', name: '', proficiency: 80, description: '' })
        setShowAddForm(false)
      },
    })
  }

  const handleDelete = async (id: number, name: string) => {
    const ok = await confirm({
      title: '스킬 삭제',
      description: `"${name}" 스킬을 삭제하시겠습니까?`,
      confirmLabel: '삭제',
      variant: 'destructive',
    })
    if (!ok) return
    deleteSkill.mutate(id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(prev => !prev)}>
          <Plus className="size-3" /> 추가
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <AdminLabel>Category</AdminLabel>
                {existingCategories.length > 0 ? (
                  <Select value={newSkill.category} onValueChange={v => setNewSkill(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <AdminInput
                    placeholder="새 카테고리명"
                    value={newSkill.category}
                    onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))}
                  />
                )}
              </div>
              <div>
                <AdminLabel>Name</AdminLabel>
                <AdminInput
                  placeholder="스킬명"
                  value={newSkill.name}
                  onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <AdminLabel>Proficiency (%)</AdminLabel>
                <AdminInput
                  type="number"
                  min={0}
                  max={100}
                  value={newSkill.proficiency}
                  onChange={e => setNewSkill(p => ({ ...p, proficiency: Number(e.target.value) }))}
                />
              </div>
              <div>
                <AdminLabel>Description</AdminLabel>
                <AdminInput
                  placeholder="설명 (선택)"
                  value={newSkill.description ?? ''}
                  onChange={e => setNewSkill(p => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                취소
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleCreate}
                disabled={createSkill.isPending}
              >
                {createSkill.isPending && <Loader2 className="size-3 animate-spin" />}
                추가
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {skillGroups?.map(group => (
        <div key={group.category}>
          <h4 className="text-sm font-semibold mb-3">{group.category}</h4>
          <div className="flex flex-col gap-2">
            {group.items.map(skill => (
              <SkillRow
                key={skill.id}
                skill={skill}
                category={group.category}
                isEditing={editingId === skill.id}
                editForm={editForm}
                onStartEdit={() => {
                  setEditingId(skill.id)
                  setEditForm({
                    category: group.category,
                    name: skill.name,
                    proficiency: skill.proficiency,
                    description: skill.description ?? '',
                  })
                }}
                onCancelEdit={() => setEditingId(null)}
                onEditFormChange={setEditForm}
                onDelete={() => handleDelete(skill.id, skill.name)}
                deleteIsPending={deleteSkill.isPending}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface SkillRowProps {
  skill: { id: number; name: string; proficiency: number; description: string | null }
  category: string
  isEditing: boolean
  editForm: Partial<CreateSkillBody>
  onStartEdit: () => void
  onCancelEdit: () => void
  onEditFormChange: (form: Partial<CreateSkillBody>) => void
  onDelete: () => void
  deleteIsPending: boolean
}

function SkillRow({
  skill,
  isEditing,
  editForm,
  onStartEdit,
  onCancelEdit,
  onEditFormChange,
  onDelete,
  deleteIsPending,
}: SkillRowProps) {
  const updateSkill = useUpdateSkill(skill.id)

  const handleSave = () => {
    const cleaned = {
      ...editForm,
      description: editForm.description?.trim() || undefined,
    }
    updateSkill.mutate(cleaned, { onSuccess: () => onCancelEdit() })
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <AdminLabel>Name</AdminLabel>
              <AdminInput
                value={editForm.name ?? ''}
                onChange={e => onEditFormChange({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <AdminLabel>Proficiency (%)</AdminLabel>
              <AdminInput
                type="number"
                min={0}
                max={100}
                value={editForm.proficiency ?? 0}
                onChange={e => onEditFormChange({ ...editForm, proficiency: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <AdminLabel>Description</AdminLabel>
              <AdminInput
                value={editForm.description ?? ''}
                onChange={e => onEditFormChange({ ...editForm, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onCancelEdit}>
              취소
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={updateSkill.isPending}>
              {updateSkill.isPending && <Loader2 className="size-3 animate-spin" />}
              저장
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <span className="text-sm">{skill.name}</span>
        <Badge variant="outline" className="text-xs">
          {skill.proficiency}%
        </Badge>
        {skill.description && <span className="text-xs text-muted-foreground">{skill.description}</span>}
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onStartEdit} aria-label="수정">
          <Pencil className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={deleteIsPending}
          aria-label="삭제"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Education ───

function createEmptyEducationTranslation(locale: LocaleCode): EducationTranslation {
  return { locale, institution: '', degree: '' }
}

function EducationSection() {
  const { data: educationList, isLoading } = useEducation()
  const createEducation = useCreateEducation()
  const deleteEducation = useDeleteEducation()
  const confirm = useConfirmStore(state => state.confirm)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [period, setPeriod] = useState('')

  const {
    activeLocale,
    setActiveLocale,
    translations,
    currentTranslation,
    updateField,
    resetTranslations,
    setInitial,
  } = useTranslationForm({ emptyFactory: createEmptyEducationTranslation })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  const resetForm = () => {
    setPeriod('')
    resetTranslations()
    setShowForm(false)
    setEditingId(null)
  }

  const handleCreate = () => {
    if (!period.trim()) return
    createEducation.mutate(
      { period, translations: translations.filter(t => t.institution.trim()) },
      { onSuccess: resetForm },
    )
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: '학력 삭제',
      description: '학력을 삭제하시겠습니까?',
      confirmLabel: '삭제',
      variant: 'destructive',
    })
    if (!ok) return
    deleteEducation.mutate(id)
  }

  const startEdit = async (edu: { id: number }) => {
    const detail = await adminApi.get(`api/portfolio/education/${edu.id}`).json<EducationDetail>()
    setEditingId(detail.id)
    setPeriod(detail.period)
    setInitial(
      LOCALE_TABS.map(l => {
        const existing = detail.translations.find(t => t.locale === l.code)
        return existing ?? createEmptyEducationTranslation(l.code as LocaleCode)
      }),
    )
    setShowForm(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="size-3" /> 추가
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 flex flex-col gap-5">
            <div>
              <AdminLabel>Period</AdminLabel>
              <AdminInput placeholder="2018 - 2022" value={period} onChange={e => setPeriod(e.target.value)} />
            </div>

            <LocaleTabs activeLocale={activeLocale} onChange={setActiveLocale} />

            {currentTranslation && (
              <div className="flex flex-col gap-4">
                <div>
                  <AdminLabel>Institution</AdminLabel>
                  <AdminInput
                    value={currentTranslation.institution}
                    onChange={e => updateField(activeLocale, 'institution', e.target.value)}
                  />
                </div>
                <div>
                  <AdminLabel>Degree</AdminLabel>
                  <AdminInput
                    value={currentTranslation.degree}
                    onChange={e => updateField(activeLocale, 'degree', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                취소
              </Button>
              <EducationSaveButton
                editingId={editingId}
                period={period}
                translations={translations}
                createIsPending={createEducation.isPending}
                onCreate={handleCreate}
                onSuccess={resetForm}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {educationList?.map(edu => (
        <div
          key={edu.id}
          className={`flex items-center justify-between px-3 py-3 rounded-md border ${editingId === edu.id ? 'border-primary bg-primary/5' : ''}`}
        >
          <div>
            <span className="text-sm font-medium">{edu.institution || '기관 없음'}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{edu.period}</span>
              <span className="text-xs text-muted-foreground">{edu.degree}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => startEdit(edu)}
              aria-label="수정"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(edu.id)}
              disabled={deleteEducation.isPending}
              aria-label="삭제"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function EducationSaveButton({
  editingId,
  period,
  translations,
  createIsPending,
  onCreate,
  onSuccess,
}: {
  editingId: number | null
  period: string
  translations: EducationTranslation[]
  createIsPending: boolean
  onCreate: () => void
  onSuccess: () => void
}) {
  const updateEducation = useUpdateEducation(editingId ?? 0)

  if (editingId) {
    const handleUpdate = () => {
      updateEducation.mutate(
        {
          period,
          translations: translations
            .filter(t => t.institution.trim())
            .map(({ locale, institution, degree }) => ({ locale, institution, degree })),
        },
        { onSuccess },
      )
    }
    return (
      <Button type="button" size="sm" onClick={handleUpdate} disabled={updateEducation.isPending}>
        {updateEducation.isPending && <Loader2 className="size-3 animate-spin" />}
        저장
      </Button>
    )
  }

  return (
    <Button type="button" size="sm" variant="secondary" onClick={onCreate} disabled={createIsPending}>
      {createIsPending && <Loader2 className="size-3 animate-spin" />}
      추가
    </Button>
  )
}

// ─── Locales ───

function LocalesSection() {
  const { data: locales, isLoading } = useLocales()
  const createLocale = useCreateLocale()
  const deleteLocale = useDeleteLocale()
  const confirm = useConfirmStore(state => state.confirm)
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  const handleCreate = () => {
    if (!code.trim() || !label.trim()) return
    createLocale.mutate(
      { code, label },
      {
        onSuccess: () => {
          setCode('')
          setLabel('')
        },
      },
    )
  }

  const handleDelete = async (id: number, localeCode: string) => {
    const ok = await confirm({
      title: '로케일 삭제',
      description: `"${localeCode}" 로케일을 삭제하시겠습니까?`,
      confirmLabel: '삭제',
      variant: 'destructive',
    })
    if (!ok) return
    deleteLocale.mutate(id)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <AdminInput placeholder="code (ko)" value={code} onChange={e => setCode(e.target.value)} className="w-32" />
        <AdminInput
          placeholder="label (한국어)"
          value={label}
          onChange={e => setLabel(e.target.value)}
          className="flex-1"
        />
        <Button type="button" size="sm" onClick={handleCreate} disabled={createLocale.isPending}>
          {createLocale.isPending && <Loader2 className="size-3 animate-spin" />}
          저장
        </Button>
      </div>

      {locales?.map(locale => (
        <div key={locale.id} className="flex items-center justify-between px-3 py-2.5 rounded-md border">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{locale.code}</Badge>
            <span className="text-sm">{locale.label}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => handleDelete(locale.id, locale.code)}
            disabled={deleteLocale.isPending}
            aria-label="삭제"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
