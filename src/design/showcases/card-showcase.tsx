import { useIntl } from 'react-intl'
import { MoreHorizontal, Pencil } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * La carte et le séparateur — les deux pièces de mise en page du lot.
 *
 * La variante `accent` mérite d'être vue à côté de `default` : c'est l'inverse
 * exact. Le CADRE est gris et le CONTENU est blanc posé dessus. C'est ce qui
 * donne l'en-tête affleurant des tableaux, sans dessiner de bordure.
 */
export function CardShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.states.variants')}
        hint={t('design.card.hint')}
      >
        <ShowcaseItem label="default">
          <Card className="w-80">
            <CardHeader>
              <CardHeading>
                <CardTitle>Groupe Sahara Voyages</CardTitle>
                <CardDescription>{t('design.card.subtitle')}</CardDescription>
              </CardHeading>
              <CardToolbar>
                <Button
                  mode="icon"
                  variant="ghost"
                  size="sm"
                  aria-label="Modifier"
                >
                  <Pencil />
                </Button>
                <Button mode="icon" variant="ghost" size="sm" aria-label="Plus">
                  <MoreHorizontal />
                </Button>
              </CardToolbar>
            </CardHeader>
            <CardContent>
              <p className="text-ink-secondary text-2sm">
                {t('design.card.body')}
              </p>
            </CardContent>
            <CardFooter>
              <span className="text-ink-muted text-2xs">
                {t('design.card.footer')}
              </span>
            </CardFooter>
          </Card>
        </ShowcaseItem>

        <ShowcaseItem label="accent">
          <Card variant="accent" className="w-80">
            <CardHeader>
              <CardHeading>
                <CardTitle>Groupe Sahara Voyages</CardTitle>
              </CardHeading>
              <CardToolbar>
                <Button mode="icon" variant="ghost" size="sm" aria-label="Plus">
                  <MoreHorizontal />
                </Button>
              </CardToolbar>
            </CardHeader>
            <CardContent>
              <p className="text-ink-secondary text-2sm">
                {t('design.card.body')}
              </p>
            </CardContent>
            <CardFooter>
              <span className="text-ink-muted text-2xs">
                {t('design.card.footer')}
              </span>
            </CardFooter>
          </Card>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.card.separator')}
        hint={t('design.card.separatorHint')}
      >
        <ShowcaseItem label="horizontal">
          <div className="flex w-64 flex-col gap-3">
            <span className="text-2sm text-ink">{t('design.card.line1')}</span>
            <Separator />
            <span className="text-2sm text-ink">{t('design.card.line2')}</span>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label="vertical">
          <div className="flex h-9 items-center gap-3">
            <span className="text-2sm text-ink">Tunis</span>
            <Separator orientation="vertical" />
            <span className="text-2sm text-ink">Sousse</span>
            <Separator orientation="vertical" />
            <span className="text-2sm text-ink">Sfax</span>
          </div>
        </ShowcaseItem>
      </ShowcaseSection>
    </div>
  )
}
