import { Outlet } from 'react-router-dom'
import { LayoutProvider, useLayout } from './context'
import { Sidebar } from './components/sidebar'
import { Header } from './components/header'

/**
 * COQUILLE — layout-21 repris à l'identique, hors le rail d'icônes.
 *
 * Le cadre est conservé : marges de page, coins arrondis, zone de travail qui flotte
 * dans un fond gris. Décision du 19/08 — un back-office se juge à l'usage, et aucun
 * écran réel n'existe encore pour arbitrer contre le cadre.
 *
 * Seul le repli change de sens : la colonne s'efface au lieu de se réduire à un rail.
 */
function Shell() {
  const { isMobile } = useLayout()

  return (
    <>
      <Header />
      {!isMobile ? <Sidebar /> : null}
      <div className="border-border bg-background min-h-0 grow pt-(--header-height-mobile) transition-all duration-300 lg:ms-(--sidebar-width) lg:me-(--page-margin) lg:mt-[calc(var(--header-height)+var(--page-margin))] lg:mb-(--page-margin) lg:overflow-y-auto lg:rounded-ee-xl lg:border-e lg:border-b lg:pt-0 lg:in-data-[sidebar-open=false]:ms-(--page-margin) lg:in-data-[sidebar-open=false]:rounded-es-xl lg:in-data-[sidebar-open=false]:border-s">
        <main className="grow py-5 lg:py-7.5" role="main">
          <Outlet />
        </main>
      </div>
    </>
  )
}

export function Layout() {
  return (
    <LayoutProvider>
      <Shell />
    </LayoutProvider>
  )
}
