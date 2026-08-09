import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Tabs, TabsList } from '@/shared/ui/tabs'
import { cn } from '@/shared/lib/cn'

/**
 * COQUILLE DE FICHE — le cadre commun à toutes les fiches de l'ERP.
 *
 * Une fiche tiers, une fiche réservation, une fiche facture racontent des choses
 * différentes mais se tiennent de la même façon : un bandeau au nom de l'objet, une
 * rangée d'onglets, un rail de détails à droite qui se replie, et **une seule zone qui
 * défile** — celle du milieu. Ce cadre vivait dans la page Tiers, mêlé à son contenu ;
 * la fiche suivante l'aurait recopié, et il n'aurait plus jamais été tout à fait le même.
 *
 * Ce que la coquille tient, et que les fiches n'ont plus à savoir :
 *  - la grille (deux colonnes, deux rangées) et ses traits — le trait vertical est
 *    porté par les cellules de gauche, jamais dessiné à part, pour qu'il soit continu ;
 *  - la hauteur : `h-[calc(100dvh-128px)]` fige la coquille à l'écran, `overflow-hidden`
 *    empêche la page entière de défiler, et seules les deux cellules du bas défilent.
 *    C'est ce qui donne des onglets et un nom toujours visibles ;
 *  - le repli du rail, avec son état.
 *
 * En dessous de `lg`, tout retombe en une colonne et la page défile normalement : les
 * classes de grille et de hauteur sont toutes préfixées `lg:`.
 */
export function RecordShell({
  banner,
  back,
  avatar,
  title,
  badges,
  meta,
  actions,
  tabs,
  value,
  onValueChange,
  railTitle,
  rail,
  footer,
  children,
}: {
  /** Bandeau d'alerte pleine largeur au-dessus du nom (RGPD, verrou, litige…). */
  banner?: React.ReactNode
  /** Retour vers la liste, en petit au-dessus du nom. */
  back?: React.ReactNode
  /** Logo ou avatar de l'objet, à gauche du nom. */
  avatar?: React.ReactNode
  /** Le nom — un nœud, pour qu'une fiche puisse le rendre éditable en ligne. */
  title: React.ReactNode
  /** Pastilles d'état, posées à la suite du nom. */
  badges?: React.ReactNode
  /** Ligne méta sous le nom : identifier l'objet SANS lire la page. */
  meta?: readonly React.ReactNode[]
  /** Action phare + menu, alignés à la fin de la bande. */
  actions?: React.ReactNode
  /** Les `TabsTrigger` — la `TabsList` est fournie par la coquille. */
  tabs: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  /** Titre du rail — c'est lui qui porte le bouton de repli. */
  railTitle: string
  rail: React.ReactNode
  /** Ligne discrète tout en bas (créé le / modifié le). */
  footer?: React.ReactNode
  /** Les `TabsContent` — la zone centrale, seule à défiler. */
  children: React.ReactNode
}) {
  const [railCollapsed, setRailCollapsed] = React.useState(false)

  return (
    <div className="text-foreground text-[15px] lg:-mt-4 lg:flex lg:h-[calc(100dvh-128px)] lg:flex-col lg:overflow-hidden">
      {banner}

      {/* Bande NOM — compacte, refermée par une bordure sous la ligne des onglets. */}
      <div className="border-border border-b px-4 pb-4 lg:px-6">
        {back}
        <div className="mt-2 flex items-center gap-3">
          {avatar}
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              {title}
              {badges}
            </div>
            {meta && meta.length > 0 ? (
              <p className="text-muted-foreground text-2sm mt-1 flex flex-wrap items-center gap-x-2">
                {meta.map((bit, i) => (
                  <React.Fragment key={i}>
                    {i > 0 ? (
                      <span className="text-muted-foreground/50">·</span>
                    ) : null}
                    <span>{bit}</span>
                  </React.Fragment>
                ))}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="ms-auto flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>

      {/* Corps — grille 2×2 : onglets | titre du rail, puis contenu | rail. */}
      <Tabs
        value={value}
        onValueChange={onValueChange}
        className={cn(
          'lg:grid lg:min-h-0 lg:grow lg:grid-rows-[auto_minmax(0,1fr)]',
          // Replié, le rail rend sa place au contenu : la colonne se réduit à la
          // largeur de son titre, qui reste cliquable pour rouvrir. Sans cela, replier
          // ne faisait que vider la colonne — un tiers de l'écran perdu.
          railCollapsed
            ? 'lg:grid-cols-[minmax(0,1fr)_auto]'
            : 'lg:grid-cols-[minmax(0,1fr)_38%]'
        )}
      >
        {/* Onglets — soulignement et NON segmenté : mesuré, le segmenté déborde sur le
            rail dès 7 onglets avec icônes. Le layout-21 l'emploie avec 4 libellés
            courts ; ici le soulignement reste le bon choix. */}
        <div className="border-border flex [scrollbar-width:none] items-end overflow-x-auto border-b ps-4 lg:min-w-0 lg:border-e lg:ps-6 lg:pe-6 [&::-webkit-scrollbar]:hidden">
          <TabsList variant="line" size="md" className="gap-5 border-b-0!">
            {tabs}
          </TabsList>
        </div>

        {/* Titre du rail, sur la même ligne que les onglets. */}
        <div className="border-border flex items-center border-b pe-4 lg:ps-6 lg:pe-6">
          <button
            type="button"
            onClick={() => setRailCollapsed((v) => !v)}
            className="flex w-full items-center gap-1.5 py-2.5 text-start"
          >
            <ChevronDown
              className={cn(
                'text-muted-foreground size-4 transition-transform',
                railCollapsed && '-rotate-90'
              )}
            />
            <span className="text-foreground text-sm font-semibold">
              {railTitle}
            </span>
          </button>
        </div>

        {/* Zone centrale — la SEULE de gauche qui défile. */}
        <div className="fiche-scroll border-border ps-4 lg:min-h-0 lg:overflow-y-auto lg:border-e lg:ps-6 lg:pe-6">
          {children}
        </div>

        <aside className="fiche-scroll pe-4 pt-5 lg:min-h-0 lg:overflow-y-auto lg:ps-6 lg:pe-6">
          <div>{railCollapsed ? null : rail}</div>
        </aside>
      </Tabs>

      {footer}
    </div>
  )
}
