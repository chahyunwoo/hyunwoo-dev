import type { Post } from '@hyunwoo/shared/types'
import { describe, expect, it } from 'vitest'
import { buildRssFeed } from '@/entities/post'

const BASE = 'https://example.dev'

function post(slug: string, date: string, overrides: Partial<Post['meta']> = {}): Post {
  return {
    meta: {
      title: `title ${slug}`,
      description: `desc ${slug}`,
      date,
      tags: [],
      mainTag: 'DevOps',
      thumbnail: '',
      published: true,
      slug,
      readingTime: 1,
      updatedAt: date,
      ...overrides,
    },
    content: '',
  }
}

describe('buildRssFeed', () => {
  it('should order items newest first and use the newest date as lastBuildDate', () => {
    const xml = buildRssFeed([post('old', '2026-01-01'), post('new', '2026-11-01')], BASE)
    expect(xml.indexOf('/blog/new')).toBeLessThan(xml.indexOf('/blog/old'))
    expect(xml).toContain(`<lastBuildDate>${new Date('2026-11-01').toUTCString()}</lastBuildDate>`)
  })

  it('should escape XML special characters in title and description', () => {
    const xml = buildRssFeed([post('a', '2026-01-01', { title: `A & B <C> 'q'`, description: '"x"' })], BASE)
    expect(xml).toContain('<title>A &amp; B &lt;C&gt; &apos;q&apos;</title>')
    expect(xml).toContain('<description>&quot;x&quot;</description>')
  })

  it('should cap the feed at 50 items', () => {
    const posts = Array.from({ length: 60 }, (_, i) => post(`p${i}`, new Date(2026, 0, i + 1).toISOString()))
    expect(buildRssFeed(posts, BASE).match(/<item>/g)).toHaveLength(50)
  })

  it('should produce an empty channel without lastBuildDate when there are no posts', () => {
    const xml = buildRssFeed([], BASE)
    expect(xml).not.toContain('<item>')
    expect(xml).not.toContain('lastBuildDate')
  })
})
