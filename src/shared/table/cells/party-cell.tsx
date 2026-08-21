/**
 * CELLULE D'IDENTITÉ — un nom, une ligne secondaire, parfois un avatar.
 *
 * C'est la première colonne de presque toutes nos listes : un tiers et sa ville,
 * un interlocuteur et son courriel, une réservation et sa référence.
 *
 * ── TROIS DÉCISIONS ENCAPSULÉES ────────────────────────────────────────────────
 *
 *  1. **Le lien.** Quand la ligne entière est cliquable, il FAUT quand même un
 *     vrai lien ici. Une ligne de tableau ne se atteint pas au clavier — sans ce
 *     lien, la liste est inutilisable sans souris. C'est la contrepartie
 *     obligatoire du clic sur la ligne, pas une option.
 *
 *  2. **La troncature.** Un nom long ne doit ni pousser les colonnes ni passer à
 *     la ligne : il se coupe, et le nom complet reste dans l'attribut `title`.
 *
 *  2 bis. **`dir="auto"` sur le texte libre.** Un nom saisi par un agent peut être
 *     latin ou arabe, et on ne sait pas lequel à l'avance. `auto` laisse le
 *     navigateur trancher sur le premier caractère fort — c'est le seul cas où on
 *     ne décide pas. La règle complète, qui vaut partout :
 *
 *       · texte LIBRE saisi par quelqu'un        → `dir="auto"` + isolation
 *       · format UNIVERSEL (courriel, IBAN, tél) → `dir="ltr"` + isolation
 *       · chaîne formatée par `Intl`             → isolation SEULE, jamais de `dir`
 *
 *     Sans `auto`, « 12, avenue Habib Bourguiba » s'affiche
 *     « avenue Habib Bourguiba ,12 » sur une interface arabe : la virgule saute.
 *
 *  3. **La ligne secondaire est ATTÉNUÉE, pas petite.** La réduire encore la
 *     rendrait illisible ; c'est le contraste qui doit dire « information de
 *     second rang », pas la taille.
 *
 * L'avatar est facultatif — la mémoire du projet dit de ne pas mettre d'icône de
 * personne là où elle n'apporte rien.
 */
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { cn } from '@/shared/lib/cn'

export interface PartyCellProps {
  name: string
  /** Courriel, ville, référence… Absente, rien ne s'affiche. */
  secondary?: string
  /** Chemin de la fiche. Fortement conseillé dès que la ligne est cliquable. */
  href?: string
  avatarUrl?: string
  /** Initiales de repli. Sans `avatarUrl` NI `initials`, aucun avatar n'est rendu. */
  initials?: string
  className?: string
}

function PartyCell({
  name,
  secondary,
  href,
  avatarUrl,
  initials,
  className,
}: PartyCellProps) {
  const showAvatar = Boolean(avatarUrl ?? initials)

  const label = href ? (
    <Link
      to={href}
      // `relative z-1` : le lien passe AU-DESSUS de la zone cliquable de la
      // ligne, pour que le clavier et le clic aboutissent au même endroit.
      dir="auto"
      className="text-ink hover:text-ink-link relative z-1 truncate font-medium transition-colors [unicode-bidi:isolate]"
      title={name}
    >
      {name}
    </Link>
  ) : (
    <span
      dir="auto"
      className="text-ink truncate font-medium [unicode-bidi:isolate]"
      title={name}
    >
      {name}
    </span>
  )

  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      {showAvatar && (
        <Avatar className="size-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex min-w-0 flex-col">
        {label}
        {secondary && (
          <span
            dir="auto"
            className="text-ink-muted truncate text-xs [unicode-bidi:isolate]"
            title={secondary}
          >
            {secondary}
          </span>
        )}
      </div>
    </div>
  )
}

export { PartyCell }
