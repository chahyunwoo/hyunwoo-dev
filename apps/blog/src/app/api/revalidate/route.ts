import { ABOUT_PATHS, CACHE_TAGS, REVALIDATE_TYPES } from '@hyunwoo/shared/config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

interface RevalidateBody {
  secret: string
  type: string
  slug?: string
}

export async function POST(request: NextRequest) {
  if (!REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Server misconfigured' }, { status: 500 })
  }

  let body: RevalidateBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  if (body.secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const validTypes = Object.values(REVALIDATE_TYPES) as string[]
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ message: `Invalid type: ${body.type}` }, { status: 400 })
  }

  if (body.type === REVALIDATE_TYPES.BLOG) {
    revalidateTag(CACHE_TAGS.BLOG_POSTS, { expire: 0 })
    revalidateTag(CACHE_TAGS.BLOG_CATEGORIES, { expire: 0 })
    revalidateTag(CACHE_TAGS.BLOG_TAGS, { expire: 0 })
    revalidateTag(CACHE_TAGS.BLOG_RECENT, { expire: 0 })
    revalidatePath('/')
    // sitemap.xml은 정적으로 프리렌더되므로 태그 무효화만으로는 갱신되지 않는다.
    // 이걸 빼면 새 글을 발행해도 재배포 전까지 sitemap에 나타나지 않아
    // 색인이 늦어진다(실측 2026-09-04: 라이브 sitemap의 글 42개가 빌드 시점 고정).
    revalidatePath('/sitemap.xml')

    if (body.slug) {
      revalidateTag(CACHE_TAGS.BLOG_POST(body.slug), { expire: 0 })
      revalidatePath(`/blog/${body.slug}`)
    }
  }

  if (body.type === REVALIDATE_TYPES.PORTFOLIO) {
    revalidateTag(CACHE_TAGS.PORTFOLIO_PROFILE, { expire: 0 })
    revalidateTag(CACHE_TAGS.PORTFOLIO_EXPERIENCES, { expire: 0 })
    revalidateTag(CACHE_TAGS.PORTFOLIO_PROJECTS, { expire: 0 })
    revalidateTag(CACHE_TAGS.PORTFOLIO_SKILLS, { expire: 0 })
    revalidateTag(CACHE_TAGS.PORTFOLIO_EDUCATION, { expire: 0 })
    revalidateTag(CACHE_TAGS.PORTFOLIO_LOCALES, { expire: 0 })

    for (const path of ABOUT_PATHS) {
      revalidatePath(path)
    }
    // about 페이지도 sitemap에 포함되므로 함께 갱신한다.
    revalidatePath('/sitemap.xml')
  }

  return NextResponse.json({ revalidated: true, type: body.type, slug: body.slug ?? null })
}
