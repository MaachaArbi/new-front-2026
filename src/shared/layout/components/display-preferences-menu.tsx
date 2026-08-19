import { useTheme } from 'next-themes'
import { useIntl } from 'react-intl'
import { SlidersHorizontal } from 'lucide-react'
import {
  ACCENTS,
  FONTS,
  SIDEBARS,
  useDisplayPreferences,
  type Accent,
  type FontChoice,
  type SidebarTone,
} from '@/app/providers/display-preferences'
import { Button } from '@/shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Segmented } from '@/shared/ui/segmented'
import { cn } from '@/shared/lib/cn'

/**
 * PRÉFÉRENCES D'AFFICHAGE — quatre réglages, dans l'en-tête.
 *
 * Volontairement une popover et non une page : ce sont des réglages qu'on essaie en
 * regardant l'écran changer derrière. Une page de paramètres obligerait à quitter ce
 * qu'on veut juger.
 *
 * Les quatre axes ne touchent QUE des couleurs et une police — jamais une taille, ni
 * un espacement, ni une structure (voir l'ADR du 19/08). C'est ce qui permet de les
 * garantir : aucun réglage ne peut casser une mise en page.
 */
export function DisplayPreferencesMenu() {
  const intl = useIntl()
  const { theme, setTheme } = useTheme()
  const { accent, sidebar, font, setPreference, reset } =
    useDisplayPreferences()

  const t = (id: string) => intl.formatMessage({ id })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button mode="icon" variant="outline" aria-label={t('prefs.title')}>
          <SlidersHorizontal />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
          <span className="text-foreground text-sm font-semibold">
            {t('prefs.title')}
          </span>
          <button
            type="button"
            onClick={() => {
              reset()
              setTheme('system')
            }}
            className="text-primary text-2sm font-medium hover:underline"
          >
            {t('prefs.reset')}
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4">
          <p className="text-muted-foreground text-xs">{t('prefs.hint')}</p>

          <Segmented
            label={t('prefs.theme')}
            value={theme ?? 'system'}
            onChange={setTheme}
            size="sm"
            options={['light', 'dark', 'system'].map((code) => ({
              code,
              label: t(`prefs.theme.${code}`),
            }))}
          />

          <Segmented
            label={t('prefs.sidebar')}
            value={sidebar}
            onChange={(next) => setPreference('sidebar', next as SidebarTone)}
            size="sm"
            options={SIDEBARS.map((code) => ({
              code,
              label: t(`prefs.sidebar.${code}`),
            }))}
          />

          {/* L'accent se choisit à la couleur, pas au nom : un libellé « Sarcelle »
              ne dit rien tant qu'on ne l'a pas vu. Le nom reste en infobulle et en
              libellé accessible. */}
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-sm">
              {t('prefs.accent')}
            </span>
            <div
              role="radiogroup"
              aria-label={t('prefs.accent')}
              className="flex gap-2"
            >
              {ACCENTS.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={code === accent}
                  title={t(`prefs.accent.${code}`)}
                  aria-label={t(`prefs.accent.${code}`)}
                  onClick={() => setPreference('accent', code as Accent)}
                  data-accent={code}
                  className={cn(
                    'size-7 rounded-md border-2 transition-colors',
                    'bg-[var(--primary)]',
                    code === accent
                      ? 'border-foreground'
                      : 'hover:border-input border-transparent'
                  )}
                />
              ))}
            </div>
          </div>

          <Segmented
            label={t('prefs.font')}
            value={font}
            onChange={(next) => setPreference('font', next as FontChoice)}
            size="sm"
            options={FONTS.map((code) => ({
              code,
              label: t(`prefs.font.${code}`),
            }))}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
