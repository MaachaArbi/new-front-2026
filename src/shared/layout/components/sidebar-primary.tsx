import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { Plus, Sun, Moon, User, Settings, Shield, LogOut } from 'lucide-react'
import { useI18n } from '@/app/providers/i18n-provider'
import { useAuth } from '@/app/providers/auth-provider'
import { MODULES, moduleFromPath } from '../menu.config'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
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
  const { me, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const { pathname } = useLocation()

  const userName = me?.displayName ?? ''
  const userEmail = me?.email ?? ''

  const isDark = resolvedTheme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  const activeModule = moduleFromPath(pathname)
  const activeIndex = activeModule
    ? MODULES.findIndex((m) => m.id === activeModule.id)
    : -1

  return (
    // Le rail prend le fond du MENU, pas celui de la page : les deux colonnes de
    // gauche forment une seule bande, et l'axe « barre latérale claire/sombre »
    // les emmène ensemble. Les carrés de module gardent leur couleur pleine —
    // c'est le seul endroit où la couleur identifie plutôt qu'elle ne décore.
    <div className="bg-sidebar flex w-[70px] shrink-0 flex-col items-center justify-between gap-5 py-2.5 lg:w-(--sidebar-collapsed-width)">
      {/* Rail des modules */}
      <div className="relative w-full grow">
        <div className="relative flex grow flex-col items-center gap-[10px]">
          {/* Indicateur de module actif — glisse d'une icône à l'autre (ressort).
              start-1.75 = propriété logique (ADR-F04), donc correct en RTL. */}
          {activeIndex >= 0 && (
            <motion.div
              className="bg-sidebar-foreground absolute start-1 z-10 w-[3px] rounded-full"
              initial={false}
              animate={{
                y: activeIndex * RAIL_ITEM_SPACING + 7,
                height: 20,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
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
                      // Carré coloré par module (layout-21) : bordure claire + ombre
                      // qui se lève au survol. Le module actif est pleinement saturé,
                      // les autres restent en retrait — repère sans bruit.
                      'size-[34px] rounded-lg border-2 border-white shadow-sm transition-all duration-300',
                      'hover:shadow-[0_4px_12px_0_rgba(37,47,74,0.35)] dark:border-transparent',
                      // Couleurs PLEINES (jamais estompées) : c'est ce qui rend le
                      // rail net. Le module actif se repère au trait indicateur
                      // + une légère élévation (il « sort » du rail).
                      module.tint,
                      'text-white hover:text-white',
                      isActive &&
                        'scale-110 shadow-[0_4px_12px_0_rgba(37,47,74,0.35)]'
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
              className="text-sidebar-muted hover:text-sidebar-foreground"
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
              <AvatarFallback>{initials(userName)}</AvatarFallback>
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
                <AvatarFallback>{initials(userName)}</AvatarFallback>
                <AvatarIndicator className="-end-1.5 -top-1.5">
                  <AvatarStatus variant="online" className="size-2.5" />
                </AvatarIndicator>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sidebar-foreground text-sm font-semibold">
                  {userName}
                </span>
                <span className="text-sidebar-muted text-xs">{userEmail}</span>
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

            <DropdownMenuItem onClick={() => void logout()}>
              <LogOut />
              <span>{t('layout.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
