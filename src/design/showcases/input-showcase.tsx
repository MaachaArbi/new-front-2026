import { useIntl } from 'react-intl'
import { Percent, Search, User } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input, InputAddon, InputGroup, InputWrapper } from '@/shared/ui/input'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Le champ de saisie, dans tous ses états.
 *
 * Le focus ne figure pas ici : il ne se déclenche qu'au clavier, et un état
 * « simulé » en dur mentirait sur ce que fait vraiment le composant. Il est capturé
 * pour de bon dans `e2e/design.spec.ts`, en posant le curseur dans un champ.
 *
 * LECTURE SEULE et DÉSACTIVÉ sont montrés côte à côte : ce sont deux choses
 * différentes et c'est le genre de distinction qui se perd si on ne la regarde
 * jamais ensemble.
 */
export function InputShowcase() {
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
              <Input variant={size} placeholder="Groupe Sahara Voyages" />
            </div>
          </ShowcaseItem>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.states.states')}
        hint={t('design.input.statesHint')}
      >
        <ShowcaseItem label={t('design.state.default')}>
          <div className="w-56">
            <Input placeholder="Raison sociale" />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.filled')}>
          <div className="w-56">
            <Input defaultValue="Groupe Sahara Voyages" />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.readonly')}>
          <div className="w-56">
            <Input readOnly defaultValue="MF 1234567 A M 000" />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.disabled')}>
          <div className="w-56">
            <Input disabled defaultValue="Groupe Sahara Voyages" />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.invalid')}>
          <div className="flex w-56 flex-col gap-1">
            <Input type="email" aria-invalid defaultValue="sahara@" />
            <span className="text-text-danger text-2xs">
              {t('design.input.invalidExample')}
            </span>
          </div>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.input.withIcon')}
        hint={t('design.input.wrapperHint')}
      >
        <ShowcaseItem label="recherche">
          <div className="w-64">
            <InputWrapper>
              <Search />
              <Input placeholder={t('layout.search')} />
            </InputWrapper>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label="icône · sm">
          <div className="w-64">
            <InputWrapper variant="sm">
              <User />
              <Input placeholder="Interlocuteur" />
            </InputWrapper>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label={t('design.state.disabled')}>
          <div className="w-64">
            <InputWrapper className="border-border-disabled bg-fill-disabled">
              <Search />
              <Input disabled placeholder={t('layout.search')} />
            </InputWrapper>
          </div>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.input.groups')}
        hint={t('design.input.groupsHint')}
      >
        <ShowcaseItem label="préfixe">
          <div className="w-56">
            <InputGroup>
              <InputAddon>TND</InputAddon>
              <Input
                dir="ltr"
                defaultValue="11 240,500"
                className="text-end tabular-nums [unicode-bidi:isolate]"
              />
            </InputGroup>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label="suffixe">
          <div className="w-44">
            <InputGroup>
              <Input
                dir="ltr"
                defaultValue="19"
                className="text-end tabular-nums [unicode-bidi:isolate]"
              />
              <InputAddon mode="icon">
                <Percent />
              </InputAddon>
            </InputGroup>
          </div>
        </ShowcaseItem>
        <ShowcaseItem label="champ · bouton">
          <div className="w-64">
            <InputGroup>
              <Input placeholder="Code postal" />
              <Button variant="secondary">Vérifier</Button>
            </InputGroup>
          </div>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.input.types')}
        hint={t('design.input.typesHint')}
      >
        <ShowcaseItem label="fichier">
          <div className="w-72">
            <Input type="file" />
          </div>
        </ShowcaseItem>
        <ShowcaseItem label="mot de passe">
          <div className="w-56">
            <Input type="password" defaultValue="motdepasse" />
          </div>
        </ShowcaseItem>
        {/* Montré pour être ÉCARTÉ : le sélecteur natif impose sa langue et son
            format (ici 08/20/2026, à l'américaine, sur une interface française).
            C'est la raison d'être du calendrier maison. */}
        <ShowcaseItem label={t('design.input.nativeDate')}>
          <div className="w-56">
            <Input type="date" defaultValue="2026-08-20" />
          </div>
        </ShowcaseItem>
      </ShowcaseSection>
    </div>
  )
}
