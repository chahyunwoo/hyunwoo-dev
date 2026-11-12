import { InnerContainer } from '@/shared/ui'

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <InnerContainer className="h-12 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">© 2025. Cha Hyun Woo. All rights reserved.</p>
      </InnerContainer>
    </footer>
  )
}
