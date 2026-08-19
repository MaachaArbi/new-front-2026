import { Link, useLocation } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { NAV_GROUPS, SAVED_VIEWS } from '../nav.config'
import { MockValue } from '@/shared/ui/mock-value'
import { Num } from '@/shared/ui/num'
import { cn } from '@/shared/lib/cn'

/**
 * Navigation en une colonne : sections métier, puis vues enregistrées.
 *
 * Chaque entrée porte son icône — dans une liste de sept à dix lignes, la forme se
 * reconnaît avant le mot, et c'est ce qui rend la navigation rapide une fois qu'on la
 * connaît par cœur. Le compteur est aligné à la fin : on compare des nombres entre
 * eux, jamais avec le libellé qui les précède.
 */
export function SidebarNav() {
  const intl = useIntl()
  const { pathname } = useLocation()
  const t = (id: string) => intl.formatMessage({ id })

  const isActive = (path: string) => {
    const base = path.split('?')[0] ?? path
    return (
      base === pathname || (base.length > 1 && pathname.startsWith(base + '/'))
    )
  }

  const TONE: Record<string, string> = {
    warning: 'bg-[var(--color-warning)]',
    danger: 'bg-destructive',
    accent: 'bg-primary',
  }

  return (
    <nav className="flex min-h-0 grow flex-col gap-5 overflow-y-auto px-2.5 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.titleKey} className="flex flex-col gap-0.5">
          <span className="text-sidebar-muted text-2xs mb-1 px-2 font-semibold tracking-wider uppercase">
            {t(group.titleKey)}
          </span>
          {group.entries.map((entry) => {
            const Icon = entry.icon
            const active = isActive(entry.path)
            return (
              <Link
                key={entry.path}
                to={entry.path}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors',
                  active
                    ? 'bg-sidebar-active text-sidebar-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-hover'
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className="size-4 shrink-0" />
                  <span className="text-2sm truncate">{t(entry.titleKey)}</span>
                </span>
                {entry.count != null ? (
                  entry.countIsMock ? (
                    <MockValue
                      reason={`Compteur « ${t(entry.titleKey)} » : décompte serveur à demander.`}
                      className="text-sidebar-muted text-2xs"
                    >
                      <Num>{entry.count}</Num>
                    </MockValue>
                  ) : (
                    <Num className="text-sidebar-muted text-2xs">
                      {entry.count}
                    </Num>
                  )
                ) : null}
              </Link>
            )
          })}
        </div>
      ))}

      <div className="flex flex-col gap-0.5">
        <span className="text-sidebar-muted text-2xs mb-1 px-2 font-semibold tracking-wider uppercase">
          {t('nav.group.views')}
        </span>
        {SAVED_VIEWS.map((view) => (
          <Link
            key={view.path}
            to={view.path}
            className="text-sidebar-foreground hover:bg-sidebar-hover flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  'size-1.5 shrink-0 rounded-full',
                  TONE[view.tone]
                )}
              />
              <span className="text-2sm truncate">{t(view.titleKey)}</span>
            </span>
            <MockValue
              reason={`Vue enregistrée « ${t(view.titleKey)} » : décompte serveur à demander.`}
              className="text-sidebar-muted text-2xs"
            >
              <Num>{view.count}</Num>
            </MockValue>
          </Link>
        ))}
      </div>
    </nav>
  )
}
