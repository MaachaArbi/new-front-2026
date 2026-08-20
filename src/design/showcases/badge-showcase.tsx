import { useIntl } from 'react-intl'
import { Check, Clock, X } from 'lucide-react'
import { Badge, BadgeDot } from '@/shared/ui/badge'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Le badge, dans ses quatre apparences × ses variantes.
 *
 * Cette page existe pour une raison précise : le badge a montré, en mode sombre,
 * une étiquette dont le TEXTE avait la couleur du FOND. Le défaut venait du
 * template — il écrivait la même variable pour les deux — et n'a éclaté qu'au
 * moment où nous avons défini le jeton. Il ne se voyait sur aucune capture parce
 * qu'aucun écran n'affichait de badge d'état.
 *
 * Toutes les combinaisons sont donc montrées, et il faut les regarder en clair ET
 * en sombre : c'est la seule façon d'attraper ce genre de chose.
 */
const VARIANTS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'info',
  'destructive',
  'outline',
] as const

const APPEARANCES = ['default', 'light', 'outline', 'ghost'] as const

export function BadgeShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      {APPEARANCES.map((appearance) => (
        <ShowcaseSection
          key={appearance}
          title={appearance}
          hint={t(`design.badge.hint.${appearance}`)}
        >
          {VARIANTS.map((variant) => (
            <ShowcaseItem key={variant} label={variant}>
              <Badge variant={variant} appearance={appearance}>
                {t('design.badge.sample')}
              </Badge>
            </ShowcaseItem>
          ))}
        </ShowcaseSection>
      ))}

      <ShowcaseSection title={t('design.states.sizes')}>
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <ShowcaseItem key={size} label={size}>
            <Badge variant="success" appearance="light" size={size}>
              {t('design.badge.sample')}
            </Badge>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.badge.usage')}
        hint={t('design.badge.usageHint')}
      >
        <ShowcaseItem label={t('design.table.status.active')}>
          <Badge variant="success" appearance="light" size="sm">
            <Check />
            {t('design.table.status.active')}
          </Badge>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.table.status.watch')}>
          <Badge variant="warning" appearance="light" size="sm">
            <Clock />
            {t('design.table.status.watch')}
          </Badge>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.table.status.blocked')}>
          <Badge variant="destructive" appearance="light" size="sm">
            <X />
            {t('design.table.status.blocked')}
          </Badge>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.badge.dot')}>
          <Badge variant="secondary" appearance="light" size="sm">
            <BadgeDot className="text-fill-success" />
            {t('design.table.status.active')}
          </Badge>
        </ShowcaseItem>
      </ShowcaseSection>
    </div>
  )
}
