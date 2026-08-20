import { useIntl } from 'react-intl'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Cases à cocher et boutons radio, avec leurs étiquettes.
 *
 * La ligne qui compte est celle des états DÉSACTIVÉS : une case désactivée doit
 * encore montrer si elle est cochée. Le template appliquait `opacity-50` au
 * contrôle entier, coche comprise — on ne pouvait plus lire l'état.
 */
export function ChoiceShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.choice.checkbox')}
        hint={t('design.choice.checkboxHint')}
      >
        <ShowcaseItem label={t('design.state.default')}>
          <div className="flex items-center gap-2">
            <Checkbox id="c1" />
            <Label htmlFor="c1">{t('design.choice.exonerated')}</Label>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.checked')}>
          <div className="flex items-center gap-2">
            <Checkbox id="c2" defaultChecked />
            <Label htmlFor="c2">{t('design.choice.exonerated')}</Label>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.indeterminate')}>
          <div className="flex items-center gap-2">
            <Checkbox id="c3" checked="indeterminate" />
            <Label htmlFor="c3">{t('design.choice.partial')}</Label>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.invalid')}>
          <div className="flex items-center gap-2">
            <Checkbox id="c4" aria-invalid />
            <Label htmlFor="c4">{t('design.choice.terms')}</Label>
          </div>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.state.disabled')}
        hint={t('design.choice.disabledHint')}
      >
        <ShowcaseItem
          label={`${t('design.state.disabled')} · ${t('design.state.default')}`}
        >
          <div className="flex items-center gap-2">
            <Checkbox id="c5" disabled />
            <Label htmlFor="c5">{t('design.choice.exonerated')}</Label>
          </div>
        </ShowcaseItem>
        <ShowcaseItem
          label={`${t('design.state.disabled')} · ${t('design.state.checked')}`}
        >
          <div className="flex items-center gap-2">
            <Checkbox id="c6" disabled defaultChecked />
            <Label htmlFor="c6">{t('design.choice.exonerated')}</Label>
          </div>
        </ShowcaseItem>
        <ShowcaseItem
          label={`${t('design.state.disabled')} · ${t('design.state.indeterminate')}`}
        >
          <div className="flex items-center gap-2">
            <Checkbox id="c7" disabled checked="indeterminate" />
            <Label htmlFor="c7">{t('design.choice.partial')}</Label>
          </div>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection title={t('design.states.sizes')}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ShowcaseItem key={size} label={size}>
            <div className="flex items-center gap-2">
              <Checkbox id={`cs-${size}`} size={size} defaultChecked />
              <Label htmlFor={`cs-${size}`}>{size}</Label>
            </div>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>

      <ShowcaseSection title={t('design.choice.radio')}>
        <ShowcaseItem label={t('design.state.default')}>
          <RadioGroup defaultValue="virement">
            {['virement', 'cheque', 'especes'].map((v) => (
              <div key={v} className="flex items-center gap-2">
                <RadioGroupItem value={v} id={`r-${v}`} />
                <Label htmlFor={`r-${v}`} variant="secondary">
                  {t(`design.choice.pay.${v}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.disabled')}>
          <RadioGroup defaultValue="cheque" disabled>
            {['virement', 'cheque'].map((v) => (
              <div key={v} className="flex items-center gap-2">
                <RadioGroupItem value={v} id={`rd-${v}`} />
                <Label htmlFor={`rd-${v}`} variant="secondary">
                  {t(`design.choice.pay.${v}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.states.sizes')}>
          <RadioGroup defaultValue="md" size="lg">
            {(['sm', 'md'] as const).map((v) => (
              <div key={v} className="flex items-center gap-2">
                <RadioGroupItem value={v} id={`rs-${v}`} size={v} />
                <Label htmlFor={`rs-${v}`} variant="secondary">
                  {v}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ShowcaseItem>
      </ShowcaseSection>
    </div>
  )
}
