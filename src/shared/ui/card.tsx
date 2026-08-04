import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * `Card` — conteneur structurel des écrans « liste » (motif template). **Sans
 * bordure ni boîte** (comme le concept `border-none`) : le tableau **remplit la
 * largeur du contenu, à ras**. Les seuls traits visibles sont les **filets sous
 * l'en-tête et sous chaque ligne**, pas un encadré. La barre d'outils et le pied
 * gardent leur padding ; le tableau, lui, n'en a pas (flush).
 *
 * Une modif du motif se fait ici et **se propage partout**.
 */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={cn('flex flex-col', className)}
      {...props}
    />
  )
}

/** Barre d'outils de la carte (filtres, actions) : padding + trait dessous. */
export function CardToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-toolbar"
      className={cn('border-border border-b py-3', className)}
      {...props}
    />
  )
}

/** Pied de la carte (pagination) : padding, **sans trait** (la dernière ligne du
 * tableau porte déjà un filet — pas de doublon). */
export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="card-footer" className={cn('py-3', className)} {...props} />
  )
}
