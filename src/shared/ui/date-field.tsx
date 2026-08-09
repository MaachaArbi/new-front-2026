import * as React from 'react'
import { useIntl } from 'react-intl'
import { CalendarDays, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Calendar } from '@/shared/ui/calendar'
import { useDateFormat } from '@/shared/lib/use-date-format'
import { cn } from '@/shared/lib/cn'

/**
 * CHAMP DE DATE — déclencheur lisible + calendrier à nous.
 *
 * Ce qu'il remplace : `<input type="date">`, dont le format vient de la langue du
 * SYSTÈME et non de celle de l'application. Un poste en anglais affichait `mm/dd/yyyy`
 * au milieu d'une interface française, et aucune option ni règle CSS ne le change.
 *
 * La valeur reste une chaîne ISO `AAAA-MM-JJ` — exactement ce que l'API attend, donc
 * rien à convertir en entrée comme en sortie.
 */
export function DateField({
  value,
  onChange,
  /** Bornes inclusives en ISO : empêche la saisie impossible plutôt que de la refuser
   *  après coup (une date d'expiration antérieure à l'émission, par exemple). */
  min,
  max,
  placeholder,
  disabled,
  /** Un champ obligatoire ne propose pas d'effacer. */
  clearable = true,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (iso: string) => void
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  ariaLabel?: string
  className?: string
}) {
  const intl = useIntl()
  const date = useDateFormat()
  const [open, setOpen] = React.useState(false)

  const empty = value === ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-field"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            'border-input bg-background text-2sm focus-visible:border-ring focus-visible:ring-ring/30 flex h-9 w-full items-center gap-2 rounded-md border px-3 shadow-xs shadow-black/5 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        >
          <CalendarDays className="text-muted-foreground size-4 shrink-0" />
          <span
            className={cn(
              'truncate',
              empty ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {empty
              ? (placeholder ??
                intl.formatMessage({ id: 'common.dateField.placeholder' }))
              : date.day(value)}
          </span>
          {clearable && !empty && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label={intl.formatMessage({ id: 'common.clear' })}
              onClick={(event) => {
                // Sans cela, le clic ouvrirait aussi le calendrier qu'on vient de vider.
                event.stopPropagation()
                onChange('')
              }}
              className="text-muted-foreground hover:text-foreground ms-auto shrink-0"
            >
              <X className="size-3.5" />
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          value={value}
          min={min}
          max={max}
          onSelect={(iso) => {
            onChange(iso)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
