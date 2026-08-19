import { useTheme } from 'next-themes'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { Languages, Moon, PanelLeftOpen, Search, Sun } from 'lucide-react'
import { useLayout } from '../context'
import { Button } from '@/shared/ui/button'
import { Kbd } from '@/shared/ui/kbd'

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
  const { resolvedTheme, setTheme } = useTheme()
  const { isSidebarOpen, sidebarToggle } = useLayout()
  const t = (id: string) => intl.formatMessage({ id })
  const isDark = resolvedTheme === 'dark'

  return (
    <header className="border-border bg-background fixed start-0 end-0 top-0 z-10 flex h-(--header-height-mobile) shrink-0 items-stretch border-b transition-[left,right] duration-300 lg:start-(--sidebar-width) lg:end-(--page-margin) lg:top-(--page-margin) lg:h-(--header-height) lg:rounded-se-xl lg:border-e lg:border-t lg:in-data-[sidebar-open=false]:start-(--page-margin) lg:in-data-[sidebar-open=false]:rounded-ss-xl lg:in-data-[sidebar-open=false]:border-s">
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
          <nav className="text-muted-foreground text-2sm flex items-center gap-2">
            <Link
              to="/parties"
              className="hover:text-foreground transition-colors"
            >
              {t('nav.parties')}
            </Link>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">
              Groupe Sahara Voyages
            </span>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" className="text-muted-foreground gap-2">
            <Search />
            <span className="text-2sm">{t('layout.search')}</span>
            <Kbd className="ms-4">⌘K</Kbd>
          </Button>
          <Button
            mode="icon"
            variant="outline"
            aria-label={t('layout.language')}
          >
            <Languages />
          </Button>
          <Button
            mode="icon"
            variant="outline"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={
              isDark ? t('layout.theme.light') : t('layout.theme.dark')
            }
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
          <Button
            variant="ghost"
            className="gap-2 ps-1"
            aria-label={t('layout.account')}
          >
            <span className="bg-primary text-primary-foreground text-2xs flex size-6 items-center justify-center rounded-full font-semibold">
              MT
            </span>
            <span className="text-2sm text-foreground">Mehdi Trabelsi</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
