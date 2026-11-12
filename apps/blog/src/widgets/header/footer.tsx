import Link from 'next/link'
import { InnerContainer } from '@/shared/ui'

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <InnerContainer className="min-h-12 py-3 flex flex-col items-center justify-center gap-0.5">
        <p className="text-muted-foreground text-sm">© 2025. Cha Hyun Woo. All rights reserved.</p>
        <Link
          href="/blog"
          className="md:hidden text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          전체 글 보기
        </Link>
      </InnerContainer>
    </footer>
  )
}
