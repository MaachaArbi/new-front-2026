import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

/**
 * Fournisseur de thème bâti sur next-themes (ADR-F03).
 * Inspiré de vendor-metronic/full/src/providers/theme-provider.tsx, avec deux
 * écarts assumés (S3a §4) :
 *  - le TooltipProvider que Metronic y avait glissé est retiré : un fournisseur
 *    de thème ne fournit pas d'infobulles (et le composant tooltip n'existe pas
 *    encore) ;
 *  - storageKey = 'ostravel-theme' (et non 'vite-theme') ;
 *  - `attribute="data-theme"` et non `"class"` (décision A du 20/08). Les
 *    planches du système de design sont écrites sur `[data-theme="dark"]` ;
 *    aligner l'attribut évite de les retoucher à chaque livraison, et
 *    `next-themes` garde sa reprise de la préférence système et son
 *    anti-clignotement. La variante `dark:` de Tailwind suit dans globals.css.
 *
 * La bascule s'obtient via `useTheme()` importé directement de 'next-themes'.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
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
