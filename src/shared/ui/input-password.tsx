/**
 * CHAMP MOT DE PASSE — **le seul composant de ce lot qui n'est prélevé de nulle
 * part.** Ni Metronic ni ReUI ne le livrent : le template le recompose sur place,
 * quatre fois (`signin-page`, `signup-page`, `change-password-page`,
 * `auth-password`), et les quatre écrivent `absolute right-0` — une classe
 * PHYSIQUE. En arabe, l'œil resterait à droite d'un champ inversé. Les quatre
 * copies sont cassées, et personne ne l'a vu parce que c'était recopié.
 *
 * D'où la règle qu'on en tire : **ce qui porte un comportement ou un contrat
 * d'accessibilité, et qui apparaît plus d'une fois, va dans la bibliothèque.**
 * Ici les deux : le `type` de l'input change, et le bouton a besoin d'un
 * `type="button"` (sinon il soumet le formulaire) et d'un libellé qui change.
 *
 * Construit à partir de nos primitives — `Input` et `Button` — donc il hérite
 * gratuitement de la densité, de l'anneau de focus et du désactivé neutre.
 *
 * ⚠️ Le champ est TOUJOURS en `dir="ltr"`, y compris révélé — voir le commentaire
 * dans le corps : c'est le piège que la capture arabe a attrapé.
 *
 * ⚠️ `useIntl` dans une primitive : assumé. Le libellé du bouton n'est lu que par
 * les lecteurs d'écran ; le laisser en dur reviendrait à ne pas le traduire du
 * tout, c'est-à-dire à exclure l'utilisateur arabophone qui en dépend le plus.
 */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input, type inputVariants } from '@/shared/ui/input'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

type InputPasswordProps = Omit<React.ComponentProps<'input'>, 'type'> &
  VariantProps<typeof inputVariants> & {
    /** État initial. Le champ reste NON contrôlé : c'est un confort de saisie. */
    defaultVisible?: boolean
  }

function InputPassword({
  className,
  variant,
  defaultVisible = false,
  disabled,
  ...props
}: InputPasswordProps) {
  const intl = useIntl()
  const [visible, setVisible] = React.useState(defaultVisible)

  const label = intl.formatMessage({
    id: visible ? 'ui.password.hide' : 'ui.password.show',
  })

  return (
    <div className="relative">
      <Input
        // `type` bascule : c'est tout le comportement du composant.
        type={visible ? 'text' : 'password'}
        // ⚠️ `dir` doit être FORCÉ ici. `Input` ne pose `ltr` d'office que sur les
        // types à format universel, et `password` en fait partie — mais `text`,
        // non. Sans cette ligne, révéler « Sahara2026! » en arabe l'affichait
        // « !Sahara2026 » : le mot de passe changeait sous les yeux de celui qui
        // le vérifie. Un mot de passe n'a pas de sens de lecture.
        dir="ltr"
        variant={variant}
        disabled={disabled}
        // Place pour le bouton, en propriété LOGIQUE — c'est exactement ce que
        // les quatre copies du template ratent.
        className={cn('pe-(--ui-row)', className)}
        {...props}
      />
      <Button
        type="button"
        mode="icon"
        variant="ghost"
        size={variant ?? 'md'}
        disabled={disabled}
        aria-label={label}
        aria-pressed={visible}
        title={label}
        onClick={() => setVisible((current) => !current)}
        className="text-ink-muted hover:text-ink absolute end-0 top-0 hover:bg-transparent disabled:bg-transparent"
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  )
}

export { InputPassword }
