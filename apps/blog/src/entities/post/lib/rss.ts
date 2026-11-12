import type { Post } from '@hyunwoo/shared/types'

const FEED_TITLE = 'hyunwoo.dev'
const FEED_DESCRIPTION = '풀스택 개발 블로그'
const FEED_LIMIT = 50

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildRssFeed(posts: Post[], baseUrl: string) {
  const items = [...posts]
    .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime())
    .slice(0, FEED_LIMIT)

  const itemXml = items
    .map(({ meta }) => {
      const url = `${baseUrl}/blog/${encodeURIComponent(meta.slug)}`
      const category = meta.mainTag ? `\n      <category>${escapeXml(meta.mainTag)}</category>` : ''
      return `    <item>
      <title>${escapeXml(meta.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(meta.description)}</description>
      <pubDate>${new Date(meta.date).toUTCString()}</pubDate>${category}
    </item>`
    })
    .join('\n')

  // lastBuildDate 는 요청 시각이 아니라 최신 글 기준이어야 수집기가 변경 없음을 판단할 수 있다.
  const lastBuildDate = items[0]
    ? `\n    <lastBuildDate>${new Date(items[0].meta.date).toUTCString()}</lastBuildDate>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${baseUrl}</link>
    <description>${FEED_DESCRIPTION}</description>
    <language>ko-KR</language>${lastBuildDate}
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${itemXml}
  </channel>
</rss>
`
}
