import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { useIsMobile } from '../hooks/use-mobile'
import { TooltipProvider } from '@/shared/ui/tooltip'

// Prélevé de layout-21/components/context.tsx. Adapté (S3b) :
//  - persistance du repli manuel de la barre (localStorage) ;
//  - mode large piloté par la page (ADR-F02) : `pageWide` force le repli sans
//    écraser la préférence utilisateur, un seul chemin de code, aucun second
//    layout.

const SIDEBAR_STORAGE_KEY = 'ostravel-sidebar-open'

interface LayoutState {
  style: CSSProperties
  bodyClassName: string
  isMobile: boolean
  /** État effectif de la barre : préférence utilisateur ET page non-large. */
  isSidebarOpen: boolean
  /** Bascule manuelle, mémorisée. */
  sidebarToggle: () => void
  /** Déclaré par la page courante via `useWideMode` (ADR-F02). */
  setPageWide: (wide: boolean) => void
}

const LayoutContext = createContext<LayoutState | undefined>(undefined)

interface LayoutProviderProps {
  children: ReactNode
  style?: CSSProperties
  bodyClassName?: string
}

function readStoredSidebar(): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false'
}

export function LayoutProvider({
  children,
  style: customStyle,
  bodyClassName = '',
}: LayoutProviderProps) {
  const isMobile = useIsMobile()
  const [userSidebarOpen, setUserSidebarOpen] =
    useState<boolean>(readStoredSidebar)
  const [pageWide, setPageWide] = useState(false)

  const style: CSSProperties = useMemo(
    () => ({
      '--page-margin': '10px',
      '--sidebar-width': '300px',
      '--sidebar-collapsed-width': '60px',
      '--sidebar-header-height': '54px',
      '--header-height': '60px',
      '--header-height-mobile': '60px',
      ...customStyle,
    }),
    [customStyle]
  )

  const sidebarToggle = useCallback(() => {
    setUserSidebarOpen((open) => {
      const next = !open
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }, [])

  // Une page large replie la barre sans toucher à la préférence mémorisée :
  // en quittant la page, l'état utilisateur reprend.
  const isSidebarOpen = userSidebarOpen && !pageWide

  useEffect(() => {
    if (!bodyClassName) return
    const body = document.body
    const existing = body.className
    body.className = `${existing} ${bodyClassName}`.trim()
    return () => {
      body.className = existing
    }
  }, [bodyClassName])

  const value = useMemo(
    () => ({
      bodyClassName,
      style,
      isMobile,
      isSidebarOpen,
      sidebarToggle,
      setPageWide,
    }),
    [bodyClassName, style, isMobile, isSidebarOpen, sidebarToggle]
  )

  return (
    <LayoutContext.Provider value={value}>
      <div
        data-slot="layout-wrapper"
        className="flex grow"
        data-sidebar-open={isSidebarOpen}
        style={style}
      >
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </div>
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
