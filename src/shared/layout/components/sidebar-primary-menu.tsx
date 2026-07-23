import { useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '@/app/providers/i18n-provider'
import { MODULE_MENUS, moduleFromPath } from '../menu.config'
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuItem,
} from '@/shared/ui/accordion-menu'

// Réécrit de layout-21/components/sidebar-primary-menu.tsx : affiche le menu du
// MODULE COURANT (depuis menu.config), libellés métier via i18n (ADR-F06/F19).
export function SidebarPrimaryMenu() {
  const { t } = useI18n()
  const { pathname } = useLocation()

  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path + '/')),
    [pathname]
  )

  const activeModule = moduleFromPath(pathname)
  const items = activeModule ? (MODULE_MENUS[activeModule.id] ?? []) : []

  return (
    <AccordionMenu
      selectedValue={pathname}
      matchPath={matchPath}
      type="multiple"
      className="space-y-7.5 px-2.5"
      classNames={{
        label: 'text-xs font-normal text-muted-foreground mb-2',
        item: 'h-8.5 px-2.5 text-sm font-normal text-foreground hover:text-primary data-[selected=true]:bg-muted data-[selected=true]:text-foreground',
        group: '',
      }}
    >
      <AccordionMenuGroup>
        {items.map((child) => (
          <AccordionMenuItem key={child.path} value={child.path ?? '#'}>
            <Link to={child.path ?? '#'}>
              {child.icon && <child.icon />}
              <span>{t(child.titleKey)}</span>
            </Link>
          </AccordionMenuItem>
        ))}
      </AccordionMenuGroup>
    </AccordionMenu>
  )
}
