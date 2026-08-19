import { useIntl } from 'react-intl'
import { Check, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Le bouton, dans tous ses états.
 *
 * On ne montre pas seulement le cas confortable : c'est en oubliant les états
 * désactivé, en cours et destructeur qu'on les redécouvre écran par écran, et c'est
 * là qu'un produit paraît improvisé.
 */
export function ButtonShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  const VARIANTS = [
    'primary',
    'mono',
    'destructive',
    'secondary',
    'outline',
    'dashed',
    'ghost',
    'dim',
  ] as const

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection title={t('design.states.variants')}>
        {VARIANTS.map((variant) => (
          <ShowcaseItem key={variant} label={variant}>
            <Button variant={variant}>Enregistrer</Button>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.states.sizes')}
        hint={t('design.density.hint')}
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ShowcaseItem key={size} label={size}>
            <Button variant="outline" size={size}>
              Enregistrer
            </Button>
          </ShowcaseItem>
        ))}
        <ShowcaseItem label={t('design.state.iconOnly')}>
          <Button variant="outline" mode="icon" aria-label="Ajouter">
            <Plus />
          </Button>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection title={t('design.states.states')}>
        <ShowcaseItem label={t('design.state.default')}>
          <Button variant="primary">Enregistrer</Button>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.disabled')}>
          <Button variant="primary" disabled>
            Enregistrer
          </Button>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.loading')}>
          <Button variant="primary" disabled>
            <Loader2 className="animate-spin" />
            Enregistrement…
          </Button>
        </ShowcaseItem>
        <ShowcaseItem label="destructive">
          <Button variant="destructive">
            <Trash2 />
            Supprimer
          </Button>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection title={t('design.states.withIcon')}>
        <ShowcaseItem label="icône · texte">
          <Button variant="outline">
            <Plus />
            Ajouter
          </Button>
        </ShowcaseItem>
        <ShowcaseItem label="texte · icône">
          <Button variant="outline">
            Valider
            <Check />
          </Button>
        </ShowcaseItem>
        <ShowcaseItem label="mode lien">
          <Button variant="primary" mode="link">
            Tout l’historique
          </Button>
        </ShowcaseItem>
      </ShowcaseSection>
    </div>
  )
}
