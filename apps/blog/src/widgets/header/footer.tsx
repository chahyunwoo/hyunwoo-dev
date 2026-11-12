import Link from 'next/link'
import { InnerContainer } from '@/shared/ui'

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <InnerContainer className="h-12 flex items-center justify-center gap-4">
        <p className="text-muted-foreground text-sm">© 2025. Cha Hyun Woo. All rights reserved.</p>
        <Link href="/blog" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
          전체 글
        </Link>
      </InnerContainer>
    </footer>
  )
}
