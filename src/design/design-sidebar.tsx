import { NavLink } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { ArrowLeft } from 'lucide-react'
import { CATALOG } from './catalog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { cn } from '@/shared/lib/cn'

/**
 * Menu du système de design — il REMPLACE la navigation métier, il ne s'y ajoute pas.
 *
 * La coquille reste celle de l'application : même fond, mêmes jetons, même densité,
 * même thème, même sens de lecture. Un composant jugé hors de son décor se valide
 * dans un contexte qui n'existe pas.
 */
export function DesignSidebar() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <>
      <div className="border-border flex h-[calc(var(--header-height)-1px)] shrink-0 items-center gap-2.5 border-b px-4">
        <NavLink
          to="/parties"
          className="text-muted-foreground hover:text-foreground text-2sm flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t('design.title')}
        </NavLink>
      </div>

      <ScrollArea className="min-h-0 grow">
        <nav className="flex flex-col gap-4 px-2.5 py-3.5">
          {CATALOG.map((group) => (
            <div key={group.titleKey} className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-2xs mb-1 px-2.5 font-semibold tracking-wider uppercase">
                {t(group.titleKey)}
              </span>
              {group.entries.map((entry) => (
                <NavLink
                  key={entry.id}
                  to={`/design/${entry.id}`}
                  style={{ minHeight: 'var(--ui-row)' }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between gap-2 rounded-lg px-2.5 transition-colors',
                      isActive
                        ? 'bg-muted text-foreground font-medium'
                        : entry.ported
                          ? 'text-foreground hover:bg-accent'
                          : 'text-muted-foreground hover:bg-accent'
                    )
                  }
                >
                  <span className="text-2sm truncate">{t(entry.titleKey)}</span>
                  {/* Une pastille pleine = prélevé et vu ; creuse = reste à faire. */}
                  <span
                    className={cn(
                      'size-1.5 shrink-0 rounded-full',
                      entry.ported ? 'bg-primary' : 'border-input border'
                    )}
                  />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </>
  )
}
