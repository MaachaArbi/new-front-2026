import { useLocation } from 'react-router-dom'
import { useI18n } from '@/app/providers/i18n-provider'
import { moduleFromPath, MODULE_MENUS } from '@/shared/layout/menu.config'
import { useWideMode } from '@/shared/layout/hooks/use-wide-mode'
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/shared/layout/components/toolbar'

/**
 * Page de module — vide en S3b, elle affiche seulement le nom du module et de
 * l'entrée courante. Les écrans métier réels arrivent à partir de S9.
 *
 * Mode large (ADR-F02) : une seule ligne de config, `WIDE_MODULES`, déclare
 * quels modules occupent toute la largeur. La page appelle `useWideMode` en
 * conséquence — un seul chemin de code, pas de second layout.
 */
const WIDE_MODULES = new Set<string>(['catalogue'])

export function ModulePage() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const activeModule = moduleFromPath(pathname)

  useWideMode(activeModule ? WIDE_MODULES.has(activeModule.id) : false)

  const menu = activeModule ? (MODULE_MENUS[activeModule.id] ?? []) : []
  const entry = menu.find((item) => item.path === pathname)
  const isWide = activeModule ? WIDE_MODULES.has(activeModule.id) : false

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>
            {activeModule ? t(activeModule.titleKey) : 'OS-TRAVEL'}
          </ToolbarPageTitle>
          {entry && (
            <span className="text-muted-foreground text-sm">
              {t(entry.titleKey)}
            </span>
          )}
        </ToolbarHeading>
      </Toolbar>

      <div className="border-border bg-muted/30 flex min-h-64 items-center justify-center rounded-xl border border-dashed p-10 text-center">
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">
            {t('page.placeholder')}
          </span>
          {isWide && (
            <span className="text-muted-foreground text-xs">
              {t('page.wideMode')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
