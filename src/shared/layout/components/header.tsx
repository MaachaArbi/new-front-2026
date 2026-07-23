import { useLayout } from './context'
import { HeaderBreadcrumbs } from './header-breadcrumbs'
import { HeaderToolbar } from './header-toolbar'
import { HeaderMenu } from './header-menu'

// Prélevé de layout-21/components/header.tsx — propriétés logiques conservées
// (`start-`, `end-`, `border-e`, `border-s`, `pe-`, `rounded-se/ss`).
export function Header() {
  const { isMobile } = useLayout()

  return (
    <header className="border-border bg-background fixed start-0 end-0 top-0 z-10 flex h-(--header-height-mobile) shrink-0 items-stretch border-b pe-[var(--removed-body-scroll-bar-size,0px)] backdrop-blur-sm transition-[left,right] duration-300 lg:start-(--sidebar-width) lg:end-(--page-margin) lg:top-(--page-margin) lg:h-(--header-height) lg:rounded-se-xl lg:border-e lg:border-t lg:in-data-[sidebar-open=false]:start-(--sidebar-collapsed-width) lg:in-data-[sidebar-open=false]:rounded-ss-xl lg:in-data-[sidebar-open=false]:border-s">
      <div className="container-fluid flex grow items-stretch justify-between gap-2.5">
        {isMobile && <HeaderMenu />}
        {!isMobile && <HeaderBreadcrumbs />}
        <HeaderToolbar />
      </div>
    </header>
  )
}
