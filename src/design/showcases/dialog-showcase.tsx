import { useIntl } from 'react-intl'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { Textarea } from '@/shared/ui/textarea'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Dialogue et feuille latérale — deux surfaces flottantes, la même anatomie
 * (en-tête · corps · pied) et le même bouton de fermeture.
 *
 * Rien ne s'ouvre ici : ce sont des déclencheurs. Les captures d'états ouverts
 * sont prises dans `e2e/design.spec.ts`, en cliquant pour de bon — un contenu
 * Radix vit dans un portail et n'apparaît sur aucune capture statique.
 *
 * La feuille est montrée des DEUX côtés. `side="end"` s'ouvre à droite en
 * français et à gauche en arabe : c'est ce qu'on veut vérifier à l'œil.
 */
export function DialogShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.dialog.dialog')}
        hint={t('design.dialog.hint')}
      >
        <ShowcaseItem label={t('design.dialog.form')}>
          <Dialog>
            <DialogTrigger asChild>
              <Button id="dlg-form" variant="primary">
                {t('design.dialog.openForm')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('design.dialog.formTitle')}</DialogTitle>
                <DialogDescription>
                  {t('design.dialog.formDesc')}
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dlg-name">
                      {t('design.label.company')}
                    </Label>
                    <Input id="dlg-name" defaultValue="Groupe Sahara Voyages" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dlg-note">
                      {t('design.textarea.label')}
                    </Label>
                    <Textarea id="dlg-note" rows={3} />
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t('ui.cancel')}</Button>
                </DialogClose>
                <Button variant="primary">{t('ui.save')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ShowcaseItem>

        <ShowcaseItem label={t('design.dialog.confirm')}>
          <Dialog>
            <DialogTrigger asChild>
              <Button id="dlg-danger" variant="destructive">
                {t('design.dialog.openConfirm')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('design.dialog.confirmTitle')}</DialogTitle>
                <DialogDescription>
                  {t('design.dialog.confirmDesc')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t('ui.cancel')}</Button>
                </DialogClose>
                <Button variant="destructive">{t('ui.delete')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.dialog.sheet')}
        hint={t('design.dialog.sheetHint')}
      >
        {(['end', 'start'] as const).map((side) => (
          <ShowcaseItem key={side} label={`side="${side}"`}>
            <Sheet>
              <SheetTrigger asChild>
                <Button id={`sheet-${side}`} variant="secondary">
                  {t('design.dialog.openSheet')}
                </Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Groupe Sahara Voyages</SheetTitle>
                  <SheetDescription>
                    {t('design.dialog.sheetDesc')}
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`sh-${side}-name`}>
                        {t('design.label.company')}
                      </Label>
                      <Input
                        id={`sh-${side}-name`}
                        defaultValue="Groupe Sahara Voyages"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`sh-${side}-note`}>
                        {t('design.textarea.label')}
                      </Label>
                      <Textarea id={`sh-${side}-note`} rows={4} />
                    </div>
                  </div>
                </SheetBody>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="secondary">{t('ui.cancel')}</Button>
                  </SheetClose>
                  <Button variant="primary">{t('ui.save')}</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>
    </div>
  )
}
