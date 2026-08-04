import { Outlet } from 'react-router-dom'
import { useLayout } from './context'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { HeaderBreadcrumbs } from './header-breadcrumbs'

// Prélevé de layout-21/components/wrapper.tsx — propriétés logiques conservées
// (`ms-`, `me-`, `border-e`, `border-s`).
export function Wrapper() {
  const { isMobile } = useLayout()

  return (
    <>
      <Header />
      {!isMobile && <Sidebar />}

      {/* min-h-0 : autorise le panneau à se borner à la hauteur dispo pour que
          `lg:overflow-y-auto` défile à l'intérieur (S3c §3). */}
      <div className="border-border bg-background min-h-0 grow pt-(--header-height-mobile) transition-all duration-300 lg:ms-(--sidebar-width) lg:me-(--page-margin) lg:mt-[calc(var(--header-height)+var(--page-margin))] lg:mb-(--page-margin) lg:overflow-y-auto lg:rounded-ee-xl lg:border-e lg:border-b lg:pt-0 lg:in-data-[sidebar-open=false]:ms-(--sidebar-collapsed-width) lg:in-data-[sidebar-open=false]:rounded-es-xl lg:in-data-[sidebar-open=false]:border-s">
        {/* Respiration VERTICALE portée par l'enveloppe. Le padding HORIZONTAL est
            désormais porté par les éléments de page (`px-4 lg:px-7.5`), pour qu'un
            tableau de liste puisse toucher les bords (« full width ») tandis que le
            reste garde sa marge. Voir `Card`/`DataTable`. */}
        <main className="grow py-5 lg:py-7.5" role="main">
          {isMobile && (
            <div className="px-4">
              <HeaderBreadcrumbs />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </>
  )
}
