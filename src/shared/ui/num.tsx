import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * VALEUR NUMÉRIQUE — isolée de l'algorithme bidirectionnel.
 *
 * En arabe, le navigateur réordonne les suites de chiffres et de séparateurs selon
 * l'algorithme bidi d'Unicode. Constaté à l'écran : le dossier `524 568 521`
 * s'affichait `521 568 524`, et `11 240,500 TND` devenait `TND 240,500 11`.
 *
 * Ce n'est pas un défaut d'esthétique. Un numéro de dossier faux ouvre le dossier de
 * quelqu'un d'autre, et un montant dont les groupes sont permutés se lit comme un
 * autre montant. Sur une interface arabe, c'est une erreur de saisie garantie.
 *
 * `direction: ltr` fixe le sens de lecture des chiffres ; `unicode-bidi: isolate`
 * empêche la valeur d'influencer le texte qui l'entoure — sans quoi on corrigerait le
 * nombre en cassant la phrase. Le tout reste inerte en français : l'isolement d'un
 * segment déjà LTR ne change rien.
 *
 * À utiliser pour tout ce qui se lit chiffre par chiffre : montants, références,
 * numéros de téléphone, matricules, dates numériques.
 */
export function Num({
  children,
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      dir="ltr"
      className={cn('tabular-nums [unicode-bidi:isolate]', className)}
      {...props}
    >
      {children}
    </span>
  )
}
