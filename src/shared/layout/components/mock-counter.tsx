import { useIntl } from 'react-intl'
import { FlaskConical } from 'lucide-react'
import { useMockCount } from '@/shared/ui/mock-value'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

/**
 * Compteur des valeurs encore statiques présentes à l'écran.
 *
 * Il ne s'affiche que s'il y en a : sur un écran entièrement branché, il disparaît —
 * et cette disparition est l'indicateur qu'on veut. Tant qu'il est là, il reste du
 * travail nommé, pas une impression diffuse.
 */
export function MockCounter() {
  const intl = useIntl()
  const count = useMockCount()
  if (count === 0) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="border-input text-muted-foreground text-2sm inline-flex cursor-default items-center gap-2 rounded-md border border-dashed px-2.5 py-1.5">
          <FlaskConical className="size-3.5" />
          <span dir="ltr" className="tabular-nums [unicode-bidi:isolate]">
            {intl.formatMessage({ id: 'mock.counter' }, { count })}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        {intl.formatMessage({ id: 'mock.legend' })}
      </TooltipContent>
    </Tooltip>
  )
}
