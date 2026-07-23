import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { Plus, Sun, Moon, User, Settings, Shield, LogOut } from 'lucide-react'
import { useI18n } from '@/app/providers/i18n-provider'
import { MODULES, moduleFromPath } from '../menu.config'
import { CURRENT_USER } from '@/shared/dev/mock-modules'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Avatar,
  AvatarFallback,
  AvatarIndicator,
  AvatarStatus,
} from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

// Rail des modules (ADR-F02, ADR-F19). Réécrit à partir de
// layout-21/components/sidebar-primary.tsx : contenu de démonstration
// (Target/Lightning/Users, couleurs brutes, chaînes en dur) remplacé par nos
// 8 modules, tokens sémantiques et i18n.
//
// Coloration du rail : ADR-F03 laisse « une couleur par module vs teinte unique »
// explicitement à trancher. En l'absence de décision dans reference/, on prend
// la teinte unique dérivée du thème (bg-primary) — aucune couleur brute.

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const RAIL_ITEM_SPACING = 44 // 34px bouton + 10px gap

export function SidebarPrimary() {
  const { t } = useI18n()
  const { resolvedTheme, setTheme } = useTheme()
  const { pathname } = useLocation()

  const isDark = resolvedTheme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  const activeModule = moduleFromPath(pathname)
  const activeIndex = activeModule
    ? MODULES.findIndex((m) => m.id === activeModule.id)
    : -1

  return (
    <div className="flex w-[70px] shrink-0 flex-col items-center justify-between gap-5 py-2.5 lg:w-(--sidebar-collapsed-width)">
      {/* Rail des modules */}
      <div className="relative w-full grow">
        <div className="relative flex grow flex-col items-center gap-[10px]">
          {/* Indicateur de module actif — start-1.75 (propriété logique, ADR-F04) */}
          {activeIndex >= 0 && (
            <motion.div
              className="bg-primary absolute start-1.75 z-10 h-3 w-0.5 rounded-full"
              animate={{ y: activeIndex * RAIL_ITEM_SPACING + 11.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}

          {MODULES.map((module) => {
            const Icon = module.icon
            const isActive = activeModule?.id === module.id
            return (
              <Tooltip key={module.id}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    mode="icon"
                    className={cn(
                      'size-[34px] rounded-lg transition-all duration-300',
                      isActive
                        ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Link to={module.path} aria-label={t(module.titleKey)}>
                      <Icon />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t(module.titleKey)}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>

      {/* Pied du rail */}
      <div className="flex shrink-0 flex-col items-center gap-2.5">
        {/* « + » : futur catalogue des modules non achetés (ADR-F08). N'ouvre rien en S3b. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              mode="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{t('layout.addModule')}</TooltipContent>
        </Tooltip>

        {/* Menu utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger className="mb-2.5 cursor-pointer">
            <Avatar className="size-7">
              <AvatarFallback>{initials(CURRENT_USER.name)}</AvatarFallback>
              <AvatarIndicator className="-end-2 -top-2">
                <AvatarStatus variant="online" className="size-2.5" />
              </AvatarIndicator>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="mb-4 w-64"
            side="right"
            align="end"
            sideOffset={11}
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar>
                <AvatarFallback>{initials(CURRENT_USER.name)}</AvatarFallback>
                <AvatarIndicator className="-end-1.5 -top-1.5">
                  <AvatarStatus variant="online" className="size-2.5" />
                </AvatarIndicator>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-foreground text-sm font-semibold">
                  {CURRENT_USER.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {CURRENT_USER.email}
                </span>
                <Badge
                  variant="success"
                  appearance="outline"
                  size="sm"
                  className="mt-1"
                >
                  {t('layout.plan.pro')}
                </Badge>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <User />
              <span>{t('layout.user.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              <span>{t('layout.preferences')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield />
              <span>{t('layout.user.security')}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={toggleTheme}>
              {isDark ? <Sun /> : <Moon />}
              <span>
                {isDark ? t('layout.theme.light') : t('layout.theme.dark')}
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <LogOut />
              <span>{t('layout.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
