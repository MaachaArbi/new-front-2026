import { useIntl } from 'react-intl'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * L'étiquette. Deux variantes seulement — appuyée pour un champ, normale pour une
 * option dans une liste de choix (où c'est le CONTRÔLE qui porte l'attention, pas
 * son texte).
 *
 * `peer-disabled` : l'étiquette d'un champ désactivé grise **avec** lui. Elle est
 * liée au champ par `htmlFor` — cliquer dessus donne le focus au champ ; c'est ce
 * qui distingue une étiquette d'un simple bout de texte au-dessus.
 */
export function LabelShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.states.variants')}
        hint={t('design.label.hint')}
      >
        <ShowcaseItem label="primary">
          <div className="flex w-56 flex-col gap-1.5">
            <Label htmlFor="l1">{t('design.label.company')}</Label>
            <Input id="l1" defaultValue="Groupe Sahara Voyages" />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label="secondary">
          <div className="flex w-56 flex-col gap-1.5">
            <Label htmlFor="l2" variant="secondary">
              {t('design.label.company')}
            </Label>
            <Input id="l2" defaultValue="Groupe Sahara Voyages" />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.label.required')}>
          <div className="flex w-56 flex-col gap-1.5">
            <Label htmlFor="l3">
              {t('design.label.company')}
              <span className="text-text-danger ms-0.5">*</span>
            </Label>
            <Input id="l3" placeholder={t('design.label.company')} />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label="peer-disabled">
          <div className="flex w-56 flex-col-reverse gap-1.5">
            <Label htmlFor="l4">{t('design.label.company')}</Label>
            <Input id="l4" className="peer" disabled defaultValue="—" />
          </div>
        </ShowcaseItem>
      </ShowcaseSection>
    </div>
  )
}
