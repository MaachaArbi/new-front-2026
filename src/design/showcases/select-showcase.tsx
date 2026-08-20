import { useIntl } from 'react-intl'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Le sélecteur. Les listes ouvertes sont capturées séparément dans
 * `e2e/design.spec.ts` : un menu Radix vit dans un portail, il n'apparaît pas
 * sur une capture statique.
 */
const BUREAUX = [
  { value: 'tunis', label: 'myGO Tunis' },
  { value: 'sousse', label: 'myGO Sousse' },
  { value: 'sfax', label: 'myGO Sfax' },
  { value: 'djerba', label: 'myGO Djerba' },
]

export function SelectShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.states.sizes')}
        hint={t('design.density.hint')}
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ShowcaseItem key={size} label={size}>
            <div className="w-56">
              <Select defaultValue="tunis">
                <SelectTrigger size={size}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUREAUX.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>

      <ShowcaseSection title={t('design.states.states')}>
        <ShowcaseItem label={t('design.state.placeholder')}>
          <div className="w-56">
            <Select>
              <SelectTrigger id="select-repos">
                <SelectValue placeholder={t('design.select.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t('design.select.group')}</SelectLabel>
                  {BUREAUX.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectItem value="autre" disabled>
                  {t('design.select.disabledOption')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.filled')}>
          <div className="w-56">
            <Select defaultValue="sousse">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUREAUX.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.disabled')}>
          <div className="w-56">
            <Select defaultValue="tunis" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tunis">myGO Tunis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.invalid')}>
          <div className="w-56">
            <Select>
              <SelectTrigger aria-invalid>
                <SelectValue placeholder={t('design.select.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tunis">myGO Tunis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.select.indicator')}
        hint={t('design.select.indicatorHint')}
      >
        {(['start', 'end'] as const).map((side) => (
          <ShowcaseItem key={side} label={`indicatorPosition="${side}"`}>
            <div className="w-56">
              <Select defaultValue="tunis" indicatorPosition={side}>
                <SelectTrigger id={`select-ind-${side}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUREAUX.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>
    </div>
  )
}
