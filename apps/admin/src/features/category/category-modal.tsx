import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  toast,
} from '@hyunwoo/ui'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  type Category,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/entities/category'
import { getIcon, ICON_LIST } from '@/shared/lib'
import { AdminInput, AdminLabel, useConfirmStore } from '@/shared/ui'

interface CategoryModalProps {
  opened: boolean
  onClose: () => void
  onSelect?: (category: string) => void
}

export function CategoryModal({ opened, onClose, onSelect }: CategoryModalProps) {
  const { data: categories } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const confirm = useConfirmStore(state => state.confirm)

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('Folder')
  const [iconSearch, setIconSearch] = useState('')

  const filteredIcons = iconSearch
    ? ICON_LIST.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase()))
    : ICON_LIST

  const resetForm = () => {
    setName('')
    setSelectedIcon('Folder')
    setIconSearch('')
    setMode('list')
    setEditTarget(null)
  }

  const handleCreate = () => {
    if (!name.trim()) return
    createCategory.mutate({ name: name.trim(), icon: selectedIcon }, { onSuccess: () => resetForm() })
  }

  const handleUpdate = async () => {
    if (!editTarget || !name.trim()) return
    const nameChanged = editTarget.category !== name.trim()
    if (nameChanged && editTarget.count > 0) {
      const ok = await confirm({
        title: '카테고리 이름 변경',
        description: `"${editTarget.category}" -> "${name.trim()}" 변경 시 ${editTarget.count}개 포스트의 카테고리도 함께 변경됩니다. 계속하시겠습니까?`,
        confirmLabel: '변경',
        variant: 'default',
      })
      if (!ok) return
    }
    // id는 nullable이다. 목록은 발행된 글의 category 값을 groupBy한 것이라,
    // categories 테이블에 없는 이름이 글에 들어가 있으면 매칭되는 레코드가 없다.
    if (editTarget.id === null) {
      toast.error(`"${editTarget.category}"는 등록된 카테고리가 아니라 수정할 수 없습니다.`)
      return
    }
    updateCategory.mutate(
      { id: editTarget.id, name: name.trim(), icon: selectedIcon },
      { onSuccess: () => resetForm() },
    )
  }

  const handleDelete = async (cat: Category) => {
    if (cat.count > 0) {
      toast.error(
        `"${cat.category}" 카테고리에 ${cat.count}개의 포스트가 있습니다. 포스트를 먼저 다른 카테고리로 이동하세요.`,
      )
      return
    }
    const ok = await confirm({
      title: '카테고리 삭제',
      description: `"${cat.category}" 카테고리를 삭제하시겠습니까?`,
      confirmLabel: '삭제',
      variant: 'destructive',
    })
    if (!ok) return
    if (cat.id === null) {
      toast.error(`"${cat.category}"는 등록된 카테고리가 아니라 삭제할 수 없습니다.`)
      return
    }
    deleteCategory.mutate(cat.id)
  }

  const startEdit = (cat: Category) => {
    setMode('edit')
    setEditTarget(cat)
    setName(cat.category)
    setSelectedIcon(cat.icon)
  }

  return (
    <Dialog
      open={opened}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose()
          resetForm()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>카테고리 관리</DialogTitle>
        </DialogHeader>

        {mode === 'list' ? (
          <div className="flex flex-col gap-2">
            {categories?.map(cat => {
              const Icon = getIcon(cat.icon)
              return (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-2 rounded-md border border-border"
                >
                  <button
                    type="button"
                    className={`flex items-center gap-2 flex-1 bg-transparent border-none text-left ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => {
                      if (onSelect) {
                        onSelect(cat.category)
                        onClose()
                        resetForm()
                      }
                    }}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{cat.category}</span>
                    <span className="text-xs text-muted-foreground">{cat.count}개</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => startEdit(cat)}
                            aria-label="수정"
                          >
                            <Pencil size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>수정</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            disabled={cat.count > 0}
                            onClick={() => handleDelete(cat)}
                            aria-label="삭제"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{cat.count > 0 ? `${cat.count}개 포스트 사용 중` : '삭제'}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )
            })}

            <Button variant="secondary" className="w-full mt-2" onClick={() => setMode('create')}>
              <Plus size={16} />새 카테고리
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <AdminLabel htmlFor="categoryName">카테고리 이름</AdminLabel>
              <AdminInput
                id="categoryName"
                placeholder="카테고리 이름"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
            </div>

            <div>
              <span className="text-sm font-medium block mb-2">아이콘</span>
              <AdminInput
                placeholder="아이콘 검색..."
                className="mb-2 h-8 text-xs"
                value={iconSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIconSearch(e.target.value)}
              />
              <div className="max-h-[200px] overflow-auto border border-border rounded-md p-2">
                <div className="grid grid-cols-8 gap-1">
                  {filteredIcons.map(iconName => {
                    const Icon = getIcon(iconName)
                    const isSelected = selectedIcon === iconName
                    return (
                      <TooltipProvider key={iconName}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setSelectedIcon(iconName)}
                              className={`flex items-center justify-center size-9 rounded-md cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-2 border-primary bg-primary/10'
                                  : 'border border-transparent hover:bg-accent'
                              }`}
                            >
                              <Icon size={18} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{iconName}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">선택됨: {selectedIcon}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                취소
              </Button>
              <Button
                onClick={mode === 'create' ? handleCreate : handleUpdate}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="size-4 animate-spin" />}
                {mode === 'create' ? '생성' : '수정'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
