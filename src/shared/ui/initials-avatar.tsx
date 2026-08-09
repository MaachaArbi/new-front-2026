import { cn } from '@/shared/lib/cn'

/**
 * Pastille d'initiales colorée — pour représenter une personne ou une organisation
 * quand on n'a pas d'image. Complète `avatar.tsx` (primitive Radix, à base d'image) :
 * ici il n'y a rien à charger, la couleur est **dérivée du nom**.
 *
 * Pourquoi une couleur stable et non aléatoire : la même personne garde la même
 * pastille d'un écran à l'autre — l'œil la reconnaît sans lire le nom.
 */
const COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-sky-500',
] as const

const SIZES = {
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
} as const

/** Deux premières initiales ; « ? » si le nom est vide. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

/** Couleur stable dérivée du nom (hash simple, déterministe). */
export function colorOfName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1)
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return COLORS[hash % COLORS.length] ?? COLORS[0]
}

export function InitialsAvatar({
  name,
  size = 'md',
  /** Acteur inconnu (trace antérieure, système) → gris neutre, jamais une couleur. */
  muted,
  className,
}: {
  name: string
  size?: keyof typeof SIZES
  muted?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        SIZES[size],
        muted ? 'bg-muted-foreground/50' : colorOfName(name),
        className
      )}
    >
      {initialsOf(name)}
    </span>
  )
}
