import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useI18n } from '@/app/providers/i18n-provider'
import { useLayout } from './context'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { Button } from '@/shared/ui/button'
import { SidebarPrimary } from './sidebar-primary'
import { SidebarSecondary } from './sidebar-secondary'

// Prélevé de layout-21/components/header-menu.tsx : barre latérale en tiroir sur
// mobile. `side="left"` conservé (Radix miroite selon DirectionProvider en RTL).
export function HeaderMenu() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const { isMobile } = useLayout()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    setIsSheetOpen(false)
  }, [pathname])

  if (!isMobile) return null

  return (
    <div className="flex items-center">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            mode="icon"
            size="sm"
            aria-label={t('layout.openMenu')}
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent
          className="w-[275px] gap-0 p-0 lg:w-(--sidebar-width)"
          side="left"
          close={false}
        >
          <SheetHeader className="space-y-0 p-0" />
          <SheetBody className="flex grow p-0">
            <SidebarPrimary />
            <SidebarSecondary />
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  )
}
