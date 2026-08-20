import { useIntl } from 'react-intl'
import { Link, useLocation } from 'react-router-dom'
import { PanelLeftOpen, Search } from 'lucide-react'
import { useLayout } from '../context'
import { Button } from '@/shared/ui/button'
import { Kbd } from '@/shared/ui/kbd'
import { UserDropdownMenu } from './user-dropdown-menu'
import { CATALOG } from '@/design/catalog'

/**
 * Barre du haut — deux rôles, deux côtés.
 *
 * À gauche : **où je suis** (fil d'Ariane). À droite : **mes outils** — recherche,
 * langue, thème, moi. La recherche vit ici et non dans la colonne parce qu'elle
 * cherche dans toute l'application, pas dans le module courant ; elle reste aussi
 * atteignable quand la colonne est repliée.
 *
 * Le nom de l'utilisateur est visible, pas seulement son avatar : plusieurs agents
 * partagent un poste au comptoir, et agir sous la session d'un autre se paie dans
 * l'historique.
 */
export function Header() {
  const intl = useIntl()
  const { isSidebarOpen, sidebarToggle } = useLayout()
  const t = (id: string) => intl.formatMessage({ id })
  const { pathname } = useLocation()
  const isDesign = pathname.startsWith('/design')
  const component = CATALOG.flatMap((group) => group.entries).find(
    (entry) => entry.id === pathname.split('/')[2]
  )

  return (
    <header className="border-border bg-background fixed start-0 end-0 top-0 z-10 flex h-(--header-height-mobile) shrink-0 items-stretch border-b transition-[left,right] duration-300 lg:start-[calc(var(--sidebar-width)+var(--page-margin))] lg:end-(--page-margin) lg:top-(--page-margin) lg:h-(--header-height) lg:rounded-se-xl lg:border-e lg:border-t lg:in-data-[sidebar-open=false]:start-(--page-margin) lg:in-data-[sidebar-open=false]:rounded-ss-xl lg:in-data-[sidebar-open=false]:border-s">
      <div className="flex grow items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {!isSidebarOpen ? (
            <Button
              mode="icon"
              variant="ghost"
              onClick={sidebarToggle}
              aria-label={t('layout.toggleSidebar')}
            >
              <PanelLeftOpen />
            </Button>
          ) : null}
          {/* Fil d'Ariane PROVISOIRE : il déduit son chemin de la route, faute
              d'écrans qui puissent poser le leur. À remplacer par un fil posé par
              chaque page dès que les premiers écrans existeront. */}
          <nav className="text-muted-foreground text-2sm flex items-center gap-2">
            {isDesign ? (
              <>
                <Link
                  to="/design"
                  className="hover:text-foreground transition-colors"
                >
                  {t('design.title')}
                </Link>
                {component ? (
                  <>
                    <span className="text-border">/</span>
                    <span className="text-foreground font-medium">
                      {t(component.titleKey)}
                    </span>
                  </>
                ) : null}
              </>
            ) : (
              <span className="text-foreground font-medium">
                {t('nav.parties')}
              </span>
            )}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" className="text-muted-foreground gap-2">
            <Search />
            <span className="text-2sm">{t('layout.search')}</span>
            <Kbd className="ms-4">⌘K</Kbd>
          </Button>
          {/* Ni bascule de thème ni sélecteur de langue ici : ils vivent dans le
              menu utilisateur, comme dans layout-1. Deux chemins vers le même
              réglage font hésiter au lieu d'aider. */}
          {/* Avatar et menu prélevés de layout-1, déclencheur compris — la classe
              de l'image est celle du template, au pixel. */}
          <UserDropdownMenu
            trigger={
              <img
                className="border-fill-success size-9 shrink-0 cursor-pointer rounded-full border-2"
                src="/media/avatars/300-2.png"
                alt={t('layout.account')}
              />
            }
          />
        </div>
      </div>
    </header>
  )
}
