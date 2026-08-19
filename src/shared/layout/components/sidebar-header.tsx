import { useEffect } from 'react'
import { Building2, Check, ChevronsUpDown, PanelRight } from 'lucide-react'
import { useI18n } from '@/app/providers/i18n-provider'
import { useAuth } from '@/app/providers/auth-provider'
import { officesOf } from '@/shared/auth/me'
import { useOfficeStore } from '@/shared/auth/office-store'
import { useLayout } from './context'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

// Sélecteur de BUREAU (ADR-F02), alimenté par `/me` (organizations où isOffice).
// Indicateur permanent, impossible à ignorer (ADR-F20 §F20.9). `officeAccountId`
// (numérique, exception §1.1) est le choix renvoyé aux endpoints qui l'exigent.
export function SidebarHeader() {
  const { t } = useI18n()
  const { me } = useAuth()
  const { sidebarToggle } = useLayout()
  const { selectedOfficeId, setSelectedOffice } = useOfficeStore()

  const offices = me ? officesOf(me) : []
  const selected = offices.find(
    (office) => office.accountId === selectedOfficeId
  )

  // Bureau par défaut : le premier, tant qu'aucun n'est choisi.
  useEffect(() => {
    if (selectedOfficeId === null && offices.length > 0) {
      setSelectedOffice(offices[0]?.accountId ?? null)
    }
  }, [selectedOfficeId, offices, setSelectedOffice])

  return (
    <div className="border-sidebar-border flex h-[calc(var(--header-height)-1px)] items-center gap-2 border-b">
      <div className="flex w-full grow items-center justify-between gap-2.5 px-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-sidebar-muted hover:text-sidebar-foreground -ms-1.5 inline-flex px-1.5"
              disabled={offices.length === 0}
            >
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <Building2 className="size-4" />
              </div>
              <span className="text-sidebar-foreground text-sm font-medium">
                {selected?.displayName ?? t('layout.office')}
              </span>
              <ChevronsUpDown className="opacity-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" side="bottom" align="start">
            {offices.map((office) => (
              <DropdownMenuItem
                key={office.accountId}
                onClick={() => setSelectedOffice(office.accountId)}
                data-active={selectedOfficeId === office.accountId}
              >
                <div className="bg-sidebar-hover text-sidebar-muted flex size-6 items-center justify-center rounded-md">
                  <Building2 className="size-4" />
                </div>
                <span className="text-sidebar-foreground text-sm font-medium">
                  {office.displayName}
                </span>
                <Check
                  className={cn(
                    'text-primary ms-auto size-4',
                    selectedOfficeId === office.accountId
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
          className="text-sidebar-muted hover:text-sidebar-foreground hidden lg:inline-flex"
        >
          <PanelRight className="opacity-100" />
        </Button>
      </div>
    </div>
  )
}
