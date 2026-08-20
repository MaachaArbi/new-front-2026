import { useIntl } from 'react-intl'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Zone de texte. Mêmes états que le champ de saisie, et la même distinction :
 * la lecture seule reste LISIBLE. Une note de dossier qu'on n'a pas le droit de
 * modifier est précisément celle qu'on vient lire.
 */
const NOTE =
  'Client historique. Règlement à 30 jours fin de mois, accordé par la direction en 2019. Ne jamais bloquer un dossier sans passer par le responsable de bureau.'

export function TextareaShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection title={t('design.states.sizes')}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ShowcaseItem key={size} label={size}>
            <div className="w-64">
              <Textarea
                variant={size}
                rows={3}
                placeholder={t('design.textarea.placeholder')}
              />
            </div>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.states.states')}
        hint={t('design.input.statesHint')}
      >
        <ShowcaseItem label={t('design.state.filled')}>
          <div className="flex w-64 flex-col gap-1.5">
            <Label htmlFor="ta1">{t('design.textarea.label')}</Label>
            <Textarea id="ta1" rows={4} defaultValue={NOTE} />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.readonly')}>
          <div className="flex w-64 flex-col gap-1.5">
            <Label htmlFor="ta2">{t('design.textarea.label')}</Label>
            <Textarea id="ta2" rows={4} readOnly defaultValue={NOTE} />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.disabled')}>
          <div className="flex w-64 flex-col gap-1.5">
            <Label htmlFor="ta3">{t('design.textarea.label')}</Label>
            <Textarea id="ta3" rows={4} disabled defaultValue={NOTE} />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.invalid')}>
          <div className="flex w-64 flex-col gap-1.5">
            <Label htmlFor="ta4">{t('design.textarea.label')}</Label>
            <Textarea id="ta4" rows={4} aria-invalid defaultValue="" />
            <span className="text-text-danger text-2xs">
              {t('design.textarea.required')}
            </span>
          </div>
        </ShowcaseItem>
      </ShowcaseSection>
    </div>
  )
}
