import { Link, useLocation } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { PanelLeftClose, Zap } from 'lucide-react'
import { NAV_GROUPS, SAVED_VIEWS, SETTINGS_ENTRY } from '../nav.config'
import { useLayout } from '../context'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { cn } from '@/shared/lib/cn'

/**
 * La colonne de navigation — une seule (le rail d'icônes est supprimé, ADR du 19/08).
 *
 * Groupée par métier. Chaque entrée porte son icône dans la couleur de son module :
 * c'est ce qui plaisait dans le rail, conservé sans la colonne en trop.
 *
 * Le bureau est écrit en CLAIR sous le nom du produit, et ne se choisit pas. Il n'est
 * pas une préférence : c'est le filtre qui décide de tout ce que l'utilisateur voit
 * (cloisonnement RLS). Sans lui à l'écran, un client introuvable paraît inexistant.
 */
export function Sidebar() {
  const intl = useIntl()
  const { pathname } = useLocation()
  const { sidebarToggle } = useLayout()
  const t = (id: string) => intl.formatMessage({ id })

  const isActive = (path: string) => {
    const base = path.split('?')[0] ?? path
    return (
      base === pathname || (base.length > 1 && pathname.startsWith(base + '/'))
    )
  }

  const row =
    'flex items-center justify-between gap-2 rounded-lg px-2.5 transition-colors'

  return (
    <aside className="fixed start-0 top-(--page-margin) bottom-(--page-margin) z-20 flex w-(--sidebar-width) shrink-0 flex-col overflow-hidden transition-all duration-300 in-data-[sidebar-open=false]:w-(--sidebar-collapsed-width)">
      <div className="border-border bg-background flex min-h-0 grow flex-col overflow-hidden rounded-s-xl border">
        {/* Identité : le produit, puis le bureau — en texte, jamais un menu. */}
        <div className="border-border flex h-[calc(var(--header-height)-1px)] shrink-0 items-center justify-between gap-2 border-b px-4">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
              <Zap className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-foreground text-2sm truncate leading-tight font-semibold">
                OS-TRAVEL
              </span>
              <span className="text-muted-foreground text-2xs truncate leading-tight">
                myGO Tunis-Arbi
              </span>
            </span>
          </span>
          <Button
            mode="icon"
            variant="ghost"
            onClick={sidebarToggle}
            aria-label={t('layout.toggleSidebar')}
          >
            <PanelLeftClose />
          </Button>
        </div>

        {/* Barre de défilement du template : en surimpression, elle ne prend
            aucune largeur — la native en mangeait 15 px au menu. */}
        <ScrollArea className="min-h-0 grow">
          <nav className="flex flex-col gap-4 px-2.5 py-3.5">
            {NAV_GROUPS.map((group) => (
              <div key={group.titleKey} className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-2xs mb-1 px-2.5 font-semibold tracking-wider uppercase">
                  {t(group.titleKey)}
                </span>
                {group.entries.map((entry) => {
                  const Icon = entry.icon
                  const active = isActive(entry.path)
                  return (
                    <Link
                      key={entry.path}
                      to={entry.path}
                      style={{ minHeight: 'var(--ui-row)' }}
                      className={cn(
                        row,
                        active
                          ? 'bg-muted text-foreground font-medium'
                          : 'text-foreground hover:bg-accent'
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon className={cn('size-4 shrink-0', entry.tint)} />
                        <span className="text-2sm truncate">
                          {t(entry.titleKey)}
                        </span>
                      </span>
                      {entry.count != null ? (
                        <span
                          dir="ltr"
                          className="text-muted-foreground text-2xs tabular-nums [unicode-bidi:isolate]"
                        >
                          {entry.count}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            ))}

            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-2xs mb-1 px-2.5 font-semibold tracking-wider uppercase">
                {t('nav.group.views')}
              </span>
              {SAVED_VIEWS.map((view) => (
                <Link
                  key={view.path}
                  to={view.path}
                  style={{ minHeight: 'var(--ui-row)' }}
                  className={cn(row, 'text-foreground hover:bg-accent')}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        'size-1.5 shrink-0 rounded-full',
                        view.tone
                      )}
                    />
                    <span className="text-2sm truncate">
                      {t(view.titleKey)}
                    </span>
                  </span>
                  <span
                    dir="ltr"
                    className="text-muted-foreground text-2xs tabular-nums [unicode-bidi:isolate]"
                  >
                    {view.count}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </ScrollArea>

        {/* Réglages, à l'écart : on n'y va pas en travaillant. */}
        <div className="border-border shrink-0 border-t p-2.5">
          <Link
            to={SETTINGS_ENTRY.path}
            style={{ minHeight: 'var(--ui-row)' }}
            className={cn(
              row,
              'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <span className="flex items-center gap-2.5">
              <SETTINGS_ENTRY.icon className="size-4" />
              <span className="text-2sm">{t(SETTINGS_ENTRY.titleKey)}</span>
            </span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
