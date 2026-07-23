import { useState } from 'react'
import { Building2, Check, ChevronsUpDown, PanelRight } from 'lucide-react'
import { useI18n } from '@/app/providers/i18n-provider'
import { OFFICES } from '@/shared/dev/mock-modules'
import { useLayout } from './context'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

// Réécrit de layout-21/components/sidebar-header.tsx : le déroulant « équipes »
// de démonstration (Thunder AI…, couleurs brutes) devient le sélecteur de
// BUREAU (ADR-F02 : `party_account_office`). Indicateur de bureau permanent,
// impossible à ignorer (ADR-F20 §F20.9). Tokens sémantiques uniquement.
export function SidebarHeader() {
  const { t } = useI18n()
  const { sidebarToggle } = useLayout()
  const [selectedOffice, setSelectedOffice] = useState(OFFICES[0])

  return (
    <div className="border-border flex h-[calc(var(--header-height)-1px)] items-center gap-2 border-b">
      <div className="flex w-full grow items-center justify-between gap-2.5 px-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground -ms-1.5 inline-flex px-1.5"
            >
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <Building2 className="size-4" />
              </div>
              <span className="text-foreground text-sm font-medium">
                {selectedOffice?.name ?? t('layout.office')}
              </span>
              <ChevronsUpDown className="opacity-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" side="bottom" align="start">
            {OFFICES.map((office) => (
              <DropdownMenuItem
                key={office.id}
                onClick={() => setSelectedOffice(office)}
                data-active={selectedOffice?.id === office.id}
              >
                <div className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-md">
                  <Building2 className="size-4" />
                </div>
                <span className="text-foreground text-sm font-medium">
                  {office.name}
                </span>
                <Check
                  className={cn(
                    'text-primary ms-auto size-4',
                    selectedOffice?.id === office.id
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Repli manuel de la barre — mémorisé (ADR-F02) */}
        <Button
          mode="icon"
          variant="ghost"
          onClick={sidebarToggle}
          aria-label={t('layout.toggleSidebar')}
          className="text-muted-foreground hover:text-foreground hidden lg:inline-flex"
        >
          <PanelRight className="opacity-100" />
        </Button>
      </div>
    </div>
  )
}
