import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { ScrollArea } from '@/shared/ui/scroll-area'
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
 *
 * ── ÉCART AJOUTÉ le 21/08 ──────────────────────────────────────────────────────
 * Le panneau de contenu défilait avec la barre NATIVE du système. Arbi : « je
 * préfère celle du menu, elle est plus discrète ». Il a raison, et la raison est
 * mesurable : la barre native prend **15 px de largeur en permanence** et affiche
 * ses flèches ; celle-ci est posée en surimpression, ne consomme aucune largeur,
 * et n'apparaît qu'au défilement. Le menu l'utilisait déjà — le contenu ne
 * l'utilisait pas, et les deux se voyaient côte à côte.
 */
function Shell({ nav }: { nav?: ReactNode }) {
  const { isMobile } = useLayout()

  return (
    <>
      <Header />
      {!isMobile ? <Sidebar>{nav}</Sidebar> : null}
      <div className="border-border bg-background min-h-0 grow pt-(--header-height-mobile) transition-all duration-300 lg:ms-[calc(var(--sidebar-width)+var(--page-margin))] lg:me-(--page-margin) lg:mt-[calc(var(--header-height)+var(--page-margin))] lg:mb-(--page-margin) lg:overflow-hidden lg:rounded-ee-xl lg:border-e lg:border-b lg:pt-0 lg:in-data-[sidebar-open=false]:ms-(--page-margin) lg:in-data-[sidebar-open=false]:rounded-es-xl lg:in-data-[sidebar-open=false]:border-s">
        <ScrollArea className="h-full">
          <main className="grow py-5 lg:py-7.5" role="main">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </>
  )
}

/**
 * `nav` remplace la navigation métier — c'est ainsi que la page « Système de design »
 * occupe la MÊME coquille sans la dupliquer. Un composant se juge dans son décor
 * réel : même fond, même densité, même thème, même sens de lecture.
 */
export function Layout({ nav }: { nav?: ReactNode }) {
  return (
    <LayoutProvider>
      <Shell nav={nav} />
    </LayoutProvider>
  )
}
