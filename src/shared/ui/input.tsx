/**
 * CHAMP DE SAISIE — anatomie prélevée de
 * `vendor-metronic/full/src/components/ui/input.tsx`, re-cartographiée sur le
 * système « Bleu de Prusse ».
 *
 * Quatre pièces, et elles servent toutes dans un ERP :
 *   · `Input`        le champ ;
 *   · `InputAddon`   une boîte accolée, non éditable (« TND », « % », une icône) ;
 *   · `InputGroup`   colle addon + champ + bouton en un seul objet — c'est lui qui
 *                    supprime les rayons et les bordures intérieures ;
 *   · `InputWrapper` un cadre qui contient une icône ET un champ sans bordure
 *                    (la barre de recherche). Le focus se pose sur le CADRE.
 *
 * Le gros bloc de sélecteurs de `InputGroup` est repris tel quel : il encode toutes
 * les combinaisons d'adjacence (addon+champ, champ+bouton, champ de date+addon…).
 * Le réécrire « plus simplement » reviendrait à redécouvrir les cas un par un.
 *
 * ── ÉCARTS ASSUMÉS au template ─────────────────────────────────────────────────
 *
 *  1. HAUTEURS indexées sur `--ui-row` (h-10 / h-8.5 / h-7 dans le template). Même
 *     adaptation que le bouton : sans elle le réglage de densité serait cosmétique.
 *
 *  2. FOCUS : l'anneau unique du système (`--focus-ring`) remplace
 *     `ring-ring/30 ring-[3px]`, et la bordure passe au primaire. Un seul anneau
 *     pour tout le produit — c'est la règle de la planche.
 *
 *  3. DÉSACTIVÉ neutre, jamais `opacity-60`. Même motif que pour le bouton : un
 *     champ délavé se lit comme un champ en cours de chargement.
 *
 *  4. LECTURE SEULE ≠ DÉSACTIVÉ, et c'est important ici. Un champ en lecture seule
 *     doit rester LISIBLE : fond neutre, mais texte à pleine encre. Le template les
 *     confondait presque (`bg-muted/80` + curseur interdit). Dans un ERP, la moitié
 *     des champs sont en lecture seule par droit ou par statut — les griser
 *     reviendrait à rendre le dossier illisible.
 *
 *  5. PLACEHOLDER à `--text-muted` (4,7:1, AA) et non `muted-foreground/80`. Un
 *     texte indicatif se lit ; s'il ne se lit pas, il ne sert à rien.
 *
 *  6. SURVOL : la bordure monte d'un cran (`--border-strong` → `--border-stronger`).
 *     Absent du template. Ajouté pour que le champ réponde comme le bouton
 *     secondaire — dans un formulaire dense, c'est ce qui dit où on est.
 *
 *  7. Ni ombre ni `shadow-xs` : décision prise avec le bouton. Sur un formulaire de
 *     trente champs, trente ombres font du bruit et rien d'autre.
 *
 *  8. `outline-none` → `outline-hidden` : en Tailwind v4, `outline-none` supprime
 *     aussi le contour forcé des modes contrastés. Correction, pas préférence.
 *
 *  9. AJOUT : les types dont le contenu n'est JAMAIS de droite à gauche portent
 *     `dir="ltr"` d'office (voir `LTR_TYPES`). Sans ça, en arabe, `sahara@` s'affiche
 *     `@sahara` — l'algorithme bidi remonte le `@` en tête. Une adresse électronique,
 *     un IBAN, un numéro de téléphone ou un mot de passe n'ont pas de version arabe :
 *     leur imposer le sens du texte n'est pas un choix esthétique, c'est une
 *     correction. `dir` reste surchargeable au cas par cas.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

const inputVariants = cva(
  `bg-background border-border-strong text-ink flex w-full border
   transition-[color,border-color,box-shadow] duration-[120ms] ease-out
   placeholder:text-ink-muted
   hover:border-border-stronger
   focus-visible:border-fill-primary focus-visible:outline-hidden focus-visible:[box-shadow:var(--focus-ring)]
   disabled:border-border-disabled disabled:bg-fill-disabled disabled:text-ink-disabled disabled:cursor-not-allowed
   [&[readonly]]:bg-fill-disabled [&[readonly]]:cursor-default
   aria-invalid:border-fill-danger aria-invalid:focus-visible:[box-shadow:var(--focus-ring-danger)]
   file:border-input file:text-ink file:h-full file:border-0 file:border-e file:border-solid file:bg-transparent file:p-0 file:font-medium file:not-italic
   [&[type=file]]:py-0`,
  {
    variants: {
      variant: {
        lg: 'h-(--ui-row-lg) rounded-md px-4 text-sm file:me-4 file:pe-4',
        md: 'text-2sm h-(--ui-row) rounded-md px-3 file:me-3 file:pe-3',
        sm: 'h-(--ui-row-sm) rounded-md px-2.5 text-xs file:me-2.5 file:pe-2.5',
      },
    },
    defaultVariants: { variant: 'md' },
  }
)

const inputAddonVariants = cva(
  `border-border-strong text-ink-secondary bg-fill-ghost-hover flex shrink-0 items-center justify-center border
   [&_svg]:text-ink-muted`,
  {
    variants: {
      variant: {
        sm: 'h-(--ui-row-sm) min-w-(--ui-row-sm) rounded-md px-2.5 text-xs [&_svg:not([class*=size-])]:size-3.5',
        md: 'text-2sm h-(--ui-row) min-w-(--ui-row) rounded-md px-3 [&_svg:not([class*=size-])]:size-4',
        lg: 'h-(--ui-row-lg) min-w-(--ui-row-lg) rounded-md px-4 text-sm [&_svg:not([class*=size-])]:size-4',
      },
      mode: {
        default: '',
        icon: 'justify-center px-0',
      },
    },
    defaultVariants: { variant: 'md', mode: 'default' },
  }
)

/**
 * Toutes les adjacences possibles, reprises telles quelles du template. Chaque
 * ligne supprime un rayon ou une bordure entre deux pièces voisines pour que le
 * groupe se lise comme UN objet et non comme trois collés.
 */
const inputGroupVariants = cva(
  `flex items-stretch
   [&_[data-slot=input]]:grow
   [&_[data-slot=input-addon]:has(+[data-slot=input])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=input])]:border-e-0
   [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:border-e-0
   [&_[data-slot=input]+[data-slot=input-addon]]:rounded-s-none [&_[data-slot=input]+[data-slot=input-addon]]:border-s-0
   [&_[data-slot=input-addon]:has(+[data-slot=button])]:rounded-e-none
   [&_[data-slot=input]+[data-slot=button]]:rounded-s-none
   [&_[data-slot=button]+[data-slot=input]]:rounded-s-none
   [&_[data-slot=input-addon]+[data-slot=input]]:rounded-s-none
   [&_[data-slot=input-addon]+[data-slot=datefield]]:[&_[data-slot=input]]:rounded-s-none
   [&_[data-slot=datefield]:has(+[data-slot=input-addon])]:[&_[data-slot=input]]:rounded-e-none
   [&_[data-slot=input]:has(+[data-slot=button])]:rounded-e-none
   [&_[data-slot=input]:has(+[data-slot=input-addon])]:rounded-e-none
   [&_[data-slot=datefield]]:grow
   [&_[data-slot=datefield]+[data-slot=input-addon]]:rounded-s-none [&_[data-slot=datefield]+[data-slot=input-addon]]:border-s-0`
)

/**
 * Le cadre qui porte l'icône. Le champ à l'intérieur perd bordure, fond et anneau :
 * c'est le CADRE qui reçoit le focus, sinon on verrait deux anneaux imbriqués.
 */
const inputWrapperVariants = cva(
  `flex items-center gap-1.5
   has-[:focus-visible]:border-fill-primary has-[:focus-visible]:outline-hidden has-[:focus-visible]:[box-shadow:var(--focus-ring)]
   [&_[data-slot=datefield]]:grow
   [&_[data-slot=input]]:text-ink [&_[data-slot=input]]:flex [&_[data-slot=input]]:h-auto [&_[data-slot=input]]:w-full
   [&_[data-slot=input]]:border-0 [&_[data-slot=input]]:bg-transparent [&_[data-slot=input]]:p-0 [&_[data-slot=input]]:shadow-none
   [&_[data-slot=input]]:outline-hidden [&_[data-slot=input]]:transition-colors
   [&_[data-slot=input]]:placeholder:text-ink-muted
   [&_[data-slot=input]]:focus-visible:[box-shadow:none]
   [&_[data-slot=input]]:disabled:bg-transparent [&_[data-slot=input]]:disabled:cursor-not-allowed
   [&_svg]:text-ink-muted [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        sm: 'gap-1.25 [&_svg:not([class*=size-])]:size-3.5',
        md: 'gap-1.5 [&_svg:not([class*=size-])]:size-4',
        lg: 'gap-1.5 [&_svg:not([class*=size-])]:size-4',
      },
    },
    defaultVariants: { variant: 'md' },
  }
)

/**
 * Types dont le contenu s'écrit toujours de gauche à droite, quelle que soit la
 * langue de l'interface. La liste est volontairement courte : on n'y met que ce
 * dont le format est universel, jamais un champ de texte libre.
 */
const LTR_TYPES: readonly string[] = [
  'email',
  'tel',
  'url',
  'number',
  'password',
]

function Input({
  className,
  type,
  variant,
  dir,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  const resolvedDir =
    dir ?? (type && LTR_TYPES.includes(type) ? 'ltr' : undefined)
  return (
    <input
      data-slot="input"
      type={type}
      dir={resolvedDir}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
}

function InputAddon({
  className,
  variant,
  mode,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputAddonVariants>) {
  return (
    <div
      data-slot="input-addon"
      className={cn(inputAddonVariants({ variant, mode }), className)}
      {...props}
    />
  )
}

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      className={cn(inputGroupVariants(), className)}
      {...props}
    />
  )
}

function InputWrapper({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputWrapperVariants>) {
  return (
    <div
      data-slot="input-wrapper"
      className={cn(
        inputVariants({ variant }),
        inputWrapperVariants({ variant }),
        className
      )}
      {...props}
    />
  )
}

export {
  Input,
  InputAddon,
  InputGroup,
  InputWrapper,
  inputVariants,
  inputAddonVariants,
}
