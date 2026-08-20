/**
 * VUES ENREGISTRÉES.
 *
 * ── DEUX NIVEAUX, DÉCIDÉS LE 04/08 ─────────────────────────────────────────────
 *
 *  · **Vue ad hoc = l'URL.** Elle existe déjà, elle est partageable tout de
 *    suite, elle survit au retour arrière. C'est ce que fait « Copier le lien ».
 *  · **Vue nommée = en base.** Elle suit l'utilisateur d'un poste à l'autre et se
 *    partage avec l'équipe. Explicitement PAS le `localStorage` : il reste sur la
 *    machine, donc il ment dès qu'on change de poste.
 *
 * ── ÉTAT RÉEL ──────────────────────────────────────────────────────────────────
 * ⚠️ Les vues NOMMÉES attendent un endpoint back (différé en phase 2 par la
 * décision du 04/08). Ce composant les affiche comme **désactivées et annoncées**
 * plutôt que de les masquer : conformément à la règle du 19/08, on montre l'écran
 * complet et on marque ce qui manque, au lieu de découvrir le trou plus tard.
 *
 * Ce qui marche aujourd'hui : copier le lien de la vue courante.
 */
import { useIntl } from 'react-intl'
import { Bookmark, Check, Link2, Lock } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export interface SavedView {
  id: string
  label: string
  /** La requête de la vue, ex. « role=client&statut=bloque ». */
  query: string
}

export interface SavedViewsProps {
  /** Vues nommées. Vide tant que l'endpoint n'existe pas. */
  views?: readonly SavedView[]
  onApply?: (view: SavedView) => void
  /** Renseigné = une vue nommée est active. */
  activeViewId?: string
  onCopyLink?: () => void
}

function SavedViews({
  views = [],
  onApply,
  activeViewId,
  onCopyLink,
}: SavedViewsProps) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  const copyLink = () => {
    if (onCopyLink) return onCopyLink()
    void navigator.clipboard?.writeText(window.location.href)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm">
          <Bookmark />
          {t('ui.list.views')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60">
        <DropdownMenuItem onSelect={copyLink}>
          <Link2 />
          {t('ui.list.copyLink')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-ink-muted flex items-center gap-1.5 font-normal">
          <Lock className="size-3" />
          {t('ui.list.namedViewsPending')}
        </DropdownMenuLabel>

        {views.map((view) => (
          <DropdownMenuItem key={view.id} onSelect={() => onApply?.(view)}>
            <span className="grow">{view.label}</span>
            {view.id === activeViewId && (
              <Check className="text-primary size-4" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuItem disabled>
          <Bookmark />
          {t('ui.list.saveView')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { SavedViews }
