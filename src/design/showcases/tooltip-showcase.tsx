import { useIntl } from 'react-intl'
import { CircleAlert, Info } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * L'infobulle. Elle ne s'ouvre qu'au survol ou au focus : les captures la
 * provoquent dans `e2e/design.spec.ts` plutôt que de la figer ici.
 *
 * Chaque déclencheur porte un `id` pour que le test sache lequel viser.
 */
export function TooltipShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.states.variants')}
        hint={t('design.tooltip.hint')}
      >
        <ShowcaseItem label="dark (défaut)">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button id="tt-dark" variant="secondary">
                {t('design.tooltip.trigger')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('design.tooltip.body')}</TooltipContent>
          </Tooltip>
        </ShowcaseItem>
        <ShowcaseItem label="light">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button id="tt-light" variant="secondary">
                {t('design.tooltip.trigger')}
              </Button>
            </TooltipTrigger>
            <TooltipContent variant="light">
              {t('design.tooltip.body')}
            </TooltipContent>
          </Tooltip>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.tooltip.onIcon')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button id="tt-icon" mode="icon" variant="ghost">
                <Info />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('design.tooltip.explain')}</TooltipContent>
          </Tooltip>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.tooltip.sides')}
        hint={t('design.tooltip.sidesHint')}
      >
        {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
          <ShowcaseItem key={side} label={side}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button id={`tt-${side}`} variant="secondary" size="sm">
                  <CircleAlert />
                  {side}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={side}>
                {t('design.tooltip.body')}
              </TooltipContent>
            </Tooltip>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>
    </div>
  )
}
