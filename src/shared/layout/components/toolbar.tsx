import { type ReactNode } from 'react'

// Prélevé de layout-21/components/toolbar.tsx — primitives de barre d'outils de
// contenu, sans données de démonstration. Style tokens uniquement.
function Toolbar({ children }: { children?: ReactNode }) {
  return <div className="mb-4 flex grow flex-col gap-5 lg:mb-6">{children}</div>
}

function ToolbarActions({ children }: { children?: ReactNode }) {
  return <div className="flex items-center gap-2.5">{children}</div>
}

function ToolbarHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col flex-wrap gap-2.5 lg:gap-4">{children}</div>
  )
}

function ToolbarPageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-foreground text-xl leading-none font-medium">
      {children}
    </h1>
  )
}

function ToolbarWrapper({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      {children}
    </div>
  )
}

export {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarWrapper,
}
