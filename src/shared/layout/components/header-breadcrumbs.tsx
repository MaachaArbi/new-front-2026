import { useLocation } from 'react-router-dom'
import { PanelRight } from 'lucide-react'
import { useI18n } from '@/app/providers/i18n-provider'
import { MODULE_MENUS, flattenMenu, moduleFromPath } from '../menu.config'
import { useLayout } from './context'
import { useBreadcrumbTrail } from '../breadcrumb-trail'
import { Button } from '@/shared/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'

// Réécrit de layout-21/components/header-breadcrumbs.tsx : le fil d'Ariane de
// démonstration (Teams / Thunder AI / Dashboard) est calculé depuis la route
// réelle, libellés via i18n (ADR-F06).
export function HeaderBreadcrumbs() {
  const { t } = useI18n()
  const { isMobile, sidebarToggle } = useLayout()
  const { pathname } = useLocation()

  const trail = useBreadcrumbTrail()
  const activeModule = moduleFromPath(pathname)
  const menu = activeModule ? (MODULE_MENUS[activeModule.id] ?? []) : []
  const activeEntry = flattenMenu(menu).find((item) => item.path === pathname)

  return (
    <div className="mb-5 flex flex-row flex-wrap items-center gap-1 px-4 pt-3.5 lg:mb-0 lg:px-0 lg:pt-0">
      {!isMobile && (
        <Button
          variant="ghost"
          mode="icon"
          onClick={sidebarToggle}
          aria-label={t('layout.toggleSidebar')}
          className="hidden in-data-[sidebar-open=false]:inline-flex"
        >
          <PanelRight className="opacity-100" />
        </Button>
      )}
      <Breadcrumb>
        <BreadcrumbList>
          {trail.length > 0 ? (
            trail.map((crumb, index) => (
              <BreadcrumbItem key={`${crumb.label}-${index}`}>
                {crumb.href ? (
                  <>
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator className="text-muted-foreground text-xs">
                      /
                    </BreadcrumbSeparator>
                  </>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))
          ) : (
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t('layout.home')}</BreadcrumbLink>
            </BreadcrumbItem>
          )}
          {trail.length === 0 && activeModule && (
            <>
              <BreadcrumbSeparator className="text-muted-foreground text-xs">
                /
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {activeEntry ? (
                  <BreadcrumbLink href={activeModule.path}>
                    {t(activeModule.titleKey)}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{t(activeModule.titleKey)}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </>
          )}
          {activeEntry && (
            <>
              <BreadcrumbSeparator className="text-muted-foreground text-xs">
                /
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{t(activeEntry.titleKey)}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
