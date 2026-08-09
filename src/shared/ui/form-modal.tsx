import * as React from 'react'
import { useIntl } from 'react-intl'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/cn'

/**
 * MODALE DE FORMULAIRE — le conteneur des CRUD courts.
 *
 * Convention (ADR-F20.1, complétée le 09/08) :
 *  · formulaire COURT (jusqu'à ~7 champs) → **modale**
 *  · formulaire LONG, ou consultation d'une ligne → **panneau latéral**
 *  · formulaire complexe → **page dédiée**
 *
 * Pourquoi la modale sur les formulaires courts : un panneau pleine hauteur pour deux
 * champs, c'est beaucoup de vide pour peu de contenu, et il POUSSE le contexte hors de
 * l'écran. La modale reste centrée, courte, et laisse voir derrière elle — sur
 * « Ajouter un plafond », on continue de voir les plafonds auxquels on ajoute.
 *
 * Le pied est une BANDE pleine largeur (fond `--strip`, filet au-dessus) et non des
 * boutons flottant dans le blanc : c'est ce qui donne à la modale sa fin nette. L'action
 * destructrice se pose à l'opposé de la validation — on ne supprime pas par inertie du
 * geste.
 */
export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  /** Action destructrice, alignée à l'opposé — « Supprimer », « Retirer ». */
  destructive,
  submitLabel,
  onSubmit,
  submitting,
  /** Bloque l'enregistrement tant que le formulaire est incomplet. */
  canSubmit = true,
  /** Message d'erreur global (refus serveur non rattaché à un champ). */
  error,
  className,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  destructive?: React.ReactNode
  /** Absents = modale SANS enregistrement : l'action se fait au clic dans le corps
   *  (choisir une agence mère, par exemple). Le pied ne propose alors que « Fermer ». */
  submitLabel?: string
  onSubmit?: () => void
  submitting?: boolean
  canSubmit?: boolean
  error?: string | null
  className?: string
  children: React.ReactNode
}) {
  const intl = useIntl()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-[520px] gap-0 p-0', className)}>
        {/* La modale PORTE le formulaire : « Entrée » enregistre, comme partout. */}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (onSubmit && canSubmit && !submitting) onSubmit()
          }}
          className="flex min-h-0 flex-col"
        >
          <div className="flex flex-col gap-1 p-6 pb-4">
            <DialogTitle className="text-lg leading-6 font-semibold">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-2sm">
                {description}
              </DialogDescription>
            ) : null}
          </div>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-6 pb-6">
            {error ? (
              <p className="text-destructive text-2sm">{error}</p>
            ) : null}
            {children}
          </div>

          <div className="border-border bg-strip flex items-center justify-between gap-3 border-t px-6 py-4">
            <span>{destructive}</span>
            <span className="flex items-center gap-2">
              <Button
                type="button"
                variant={onSubmit ? 'outline' : 'primary'}
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                {intl.formatMessage({
                  id: onSubmit ? 'party.detail.cancel' : 'common.close',
                })}
              </Button>
              {onSubmit ? (
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !canSubmit}
                >
                  {submitLabel}
                </Button>
              ) : null}
            </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Un champ de la modale : libellé, contrôle, précision et erreur.
 *
 * Le même trio existait, réécrit, dans chaque panneau (`LabeledField`). Il vit ici pour
 * que modale et panneau présentent leurs champs de façon identique — sinon le passage
 * de l'un à l'autre se verrait.
 */
export function FormField({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('flex flex-col gap-1', className)}>
      <span className="text-muted-foreground text-sm">{label}</span>
      {children}
      {hint ? (
        <span className="text-muted-foreground text-xs">{hint}</span>
      ) : null}
      {error ? <span className="text-destructive text-xs">{error}</span> : null}
    </label>
  )
}
