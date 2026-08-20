import { useIntl } from 'react-intl'
import { Check, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button, ButtonLabel } from '@/shared/ui/button'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Le bouton, dans tous ses états.
 *
 * On ne montre pas seulement le cas confortable : c'est en oubliant les états
 * désactivé, en cours et destructeur qu'on les redécouvre écran par écran, et c'est
 * là qu'un produit paraît improvisé.
 *
 * Les cinq variantes sont montrées AUSSI en désactivé, côte à côte : la règle de la
 * planche — « désactivé neutre, jamais la marque en opacité réduite » — ne se juge
 * qu'en voyant les deux lignes l'une sous l'autre.
 */
const VARIANTS = [
  'primary',
  'secondary',
  'ghost',
  'destructive',
  'link',
] as const

export function ButtonShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.states.variants')}
        hint={t('design.button.variantsHint')}
      >
        {VARIANTS.map((variant) => (
          <ShowcaseItem key={variant} label={variant}>
            <Button variant={variant}>Enregistrer</Button>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.state.disabled')}
        hint={t('design.button.disabledHint')}
      >
        {VARIANTS.map((variant) => (
          <ShowcaseItem key={variant} label={variant}>
            <Button variant={variant} disabled>
              Enregistrer
            </Button>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.states.sizes')}
        hint={t('design.density.hint')}
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ShowcaseItem key={size} label={size}>
            <Button variant="secondary" size={size}>
              Enregistrer
            </Button>
          </ShowcaseItem>
        ))}
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ShowcaseItem
            key={size}
            label={`${t('design.state.iconOnly')} · ${size}`}
          >
            <Button
              variant="secondary"
              mode="icon"
              size={size}
              aria-label="Ajouter"
            >
              <Plus />
            </Button>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.states.states')}
        hint={t('design.button.loadingHint')}
      >
        <ShowcaseItem label={t('design.state.default')}>
          <Button variant="primary">
            <ButtonLabel>Enregistrer</ButtonLabel>
          </Button>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.loading')}>
          <Button variant="primary" loading>
            <Loader2 className="animate-spin" />
            <ButtonLabel>Enregistrement…</ButtonLabel>
          </Button>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.disabled')}>
          <Button variant="primary" disabled>
            <ButtonLabel>Enregistrer</ButtonLabel>
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
          <Button variant="secondary">
            <Plus />
            Ajouter
          </Button>
        </ShowcaseItem>
        <ShowcaseItem label="texte · icône">
          <Button variant="secondary">
            Valider
            <Check />
          </Button>
        </ShowcaseItem>
        <ShowcaseItem label="lien">
          <Button variant="link">Tout l’historique</Button>
        </ShowcaseItem>
      </ShowcaseSection>
    </div>
  )
}
