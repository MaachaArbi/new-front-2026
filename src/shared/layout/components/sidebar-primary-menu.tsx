import { useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '@/app/providers/i18n-provider'
import { MODULE_MENUS, moduleFromPath } from '../menu.config'
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
} from '@/shared/ui/accordion-menu'
import { Badge } from '@/shared/ui/badge'

// Réécrit de layout-21/components/sidebar-primary-menu.tsx : menu du MODULE
// COURANT depuis menu.config, en groupes de section (rythme, S3c §5), libellés
// et badges via i18n (ADR-F06/F19).
export function SidebarPrimaryMenu() {
  const { t } = useI18n()
  const { pathname } = useLocation()

  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path + '/')),
    [pathname]
  )

  const activeModule = moduleFromPath(pathname)
  const groups = activeModule ? (MODULE_MENUS[activeModule.id] ?? []) : []

  return (
    <AccordionMenu
      selectedValue={pathname}
      matchPath={matchPath}
      type="multiple"
      className="space-y-6 px-2.5"
      classNames={{
        label: 'text-xs font-normal text-muted-foreground mb-2',
        item: 'h-8.5 px-2.5 text-sm font-normal text-foreground hover:text-primary data-[selected=true]:bg-muted data-[selected=true]:text-foreground',
        group: '',
      }}
    >
      {groups.map((group) => (
        <AccordionMenuGroup key={group.titleKey}>
          <AccordionMenuLabel>{t(group.titleKey)}</AccordionMenuLabel>
          {(group.children ?? []).map((child) => (
            <AccordionMenuItem key={child.path} value={child.path ?? '#'}>
              <Link to={child.path ?? '#'}>
                <span>{t(child.titleKey)}</span>
                {child.badgeKey && (
                  <Badge
                    variant="info"
                    appearance="light"
                    size="sm"
                    className="ms-auto"
                  >
                    {t(child.badgeKey)}
                  </Badge>
                )}
                {child.badgeCount !== undefined && (
                  <Badge variant="secondary" size="sm" className="ms-auto">
                    {child.badgeCount}
                  </Badge>
                )}
              </Link>
            </AccordionMenuItem>
          ))}
        </AccordionMenuGroup>
      ))}
    </AccordionMenu>
  )
}
