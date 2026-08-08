import { cn } from '@/shared/lib/cn'

/**
 * Drapeau d'un pays (SVG `flag-icons`) — brique partagée, réutilisée par `PhoneInput`
 * et `CountrySelect`. SVG (rendu partout, Windows compris), pas emoji. `alpha2` insensible
 * à la casse ; décoratif (`aria-hidden`, le libellé du pays porte le sens).
 */
export function CountryFlag({
  alpha2,
  className,
}: {
  alpha2: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'fi shrink-0 rounded-[2px]',
        `fi-${alpha2.toLowerCase()}`,
        className
      )}
    />
  )
}
