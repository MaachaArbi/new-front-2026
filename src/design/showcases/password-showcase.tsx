import { useIntl } from 'react-intl'
import { InputPassword } from '@/shared/ui/input-password'
import { Label } from '@/shared/ui/label'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Le champ mot de passe — le seul composant du lot qu'on a écrit.
 *
 * L'état « révélé » est montré ici en dur (`defaultVisible`) : c'est le seul moyen
 * de le juger sur une capture. Le basculement réel est vérifié dans
 * `e2e/design.spec.ts`, en cliquant sur le bouton.
 */
export function PasswordShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.states.states')}
        hint={t('design.password.hint')}
      >
        <ShowcaseItem label={t('design.state.default')}>
          <div className="flex w-56 flex-col gap-1.5">
            <Label htmlFor="p1">{t('design.password.label')}</Label>
            <InputPassword id="p1" defaultValue="Sahara2026!" />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.password.revealed')}>
          <div className="flex w-56 flex-col gap-1.5">
            <Label htmlFor="p2">{t('design.password.label')}</Label>
            <InputPassword id="p2" defaultValue="Sahara2026!" defaultVisible />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.invalid')}>
          <div className="flex w-56 flex-col gap-1.5">
            <Label htmlFor="p3">{t('design.password.label')}</Label>
            <InputPassword id="p3" aria-invalid defaultValue="1234" />
            <span className="text-text-danger text-2xs">
              {t('design.password.tooShort')}
            </span>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.disabled')}>
          <div className="flex w-56 flex-col gap-1.5">
            <Label htmlFor="p4">{t('design.password.label')}</Label>
            <InputPassword id="p4" disabled defaultValue="Sahara2026!" />
          </div>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.states.sizes')}
        hint={t('design.density.hint')}
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ShowcaseItem key={size} label={size}>
            <div className="w-56">
              <InputPassword variant={size} defaultValue="Sahara2026!" />
            </div>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>
    </div>
  )
}
