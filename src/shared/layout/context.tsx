import * as React from 'react'

/**
 * Dimensions et état de la coquille — reprises de layout-21 **à l'identique**
 * (décision du 19/08 : on ne touche ni au cadre, ni aux marges, ni aux rayons tant
 * qu'aucun écran réel n'a prouvé qu'ils coûtent trop de surface).
 *
 * Une seule valeur change : `--sidebar-collapsed-width` passe de 70 px à **0**.
 * Dans le template d'origine, replier la colonne la réduisait au rail d'icônes ;
 * le rail étant supprimé, replier l'efface complètement.
 */
const LAYOUT_STYLE = {
  '--page-margin': '10px',
  '--sidebar-width': '280px',
  '--sidebar-collapsed-width': '0px',
  '--header-height': '60px',
  '--header-height-mobile': '60px',
} as React.CSSProperties

interface LayoutContextValue {
  isMobile: boolean
  isSidebarOpen: boolean
  sidebarToggle: () => void
  style: React.CSSProperties
}

const LayoutContext = React.createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(
    () => window.matchMedia('(max-width: 1023px)').matches
  )

  React.useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)')
    const onChange = () => setIsMobile(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Le fond gris et l'absence de défilement du corps viennent du template : c'est
  // ce qui fait « flotter » la zone de travail dans son cadre.
  React.useEffect(() => {
    document.body.classList.add('lg:bg-muted', 'lg:overflow-hidden')
    return () =>
      document.body.classList.remove('lg:bg-muted', 'lg:overflow-hidden')
  }, [])

  const value = React.useMemo<LayoutContextValue>(
    () => ({
      isMobile,
      isSidebarOpen,
      sidebarToggle: () => setSidebarOpen((open) => !open),
      style: LAYOUT_STYLE,
    }),
    [isMobile, isSidebarOpen]
  )

  return (
    <LayoutContext.Provider value={value}>
      {/* `flex h-full flex-col` prolonge la chaîne de hauteur html → body → #root :
          sans elle, le `grow` de la zone de travail ne produit aucun effet et le
          contenu s'arrête à mi-écran. */}
      <div
        style={value.style}
        data-sidebar-open={isSidebarOpen}
        className="flex h-full flex-col"
      >
        {children}
      </div>
    </LayoutContext.Provider>
  )
}

export function useLayout(): LayoutContextValue {
  const context = React.useContext(LayoutContext)
  if (!context) throw new Error('useLayout hors de <LayoutProvider>')
  return context
}
