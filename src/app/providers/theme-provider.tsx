import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

/**
 * Fournisseur de thème bâti sur next-themes (ADR-F03).
 * Inspiré de vendor-metronic/full/src/providers/theme-provider.tsx, avec deux
 * écarts assumés (S3a §4) :
 *  - le TooltipProvider que Metronic y avait glissé est retiré : un fournisseur
 *    de thème ne fournit pas d'infobulles (et le composant tooltip n'existe pas
 *    encore) ;
 *  - storageKey = 'ostravel-theme' (et non 'vite-theme').
 *
 * La bascule s'obtient via `useTheme()` importé directement de 'next-themes'.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      storageKey="ostravel-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
