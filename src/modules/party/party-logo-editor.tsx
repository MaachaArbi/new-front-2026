import * as React from 'react'
import { Building2, Camera, Loader2, Trash2, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ApiError } from '@/shared/api/errors'
import { ImageEditor } from '@/shared/ui/image-editor'
import { usePartyLogoMutations } from './queries'
import { LOGO_ACCEPTED_TYPES, LOGO_MAX_BYTES, type PartyNature } from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

/**
 * Éditeur du logo d'un tiers — l'avatar **est** le déclencheur (menu changer / retirer).
 * Le fichier ne traverse PAS l'API : `set` orchestre intent → dépôt **direct** chez
 * l'hébergeur → confirmation (§2.11). Pré-contrôle client (type + ≤ 2 Mio) pour échouer
 * vite ; le back reste l'autorité (svg refusé, etc.). L'avatar se régénère à la relecture
 * de la fiche (on ne stocke jamais `logoUrl`).
 *
 * ⚠️ Le **dépôt (étape 2)** échoue tant que le CORS n'est pas posé sur le seau : l'erreur
 * remonte alors en « échec du dépôt » (indiagnosticable plus finement côté navigateur).
 */
export function PartyLogoEditor({
  publicId,
  logoUrl,
  nature,
  readOnly,
  t,
}: {
  publicId: string
  logoUrl: string | null
  nature: PartyNature | undefined
  /** Tiers anonymisé (RGPD) → avatar statique, aucune retouche/upload. */
  readOnly?: boolean
  t: Translate
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const [editorOpen, setEditorOpen] = React.useState(false)
  const { set, remove } = usePartyLogoMutations(publicId)
  const FallbackIcon = nature === 'organization' ? Building2 : User
  const busy = set.isPending || remove.isPending

  const pick = () => {
    setLocalError(null)
    inputRef.current?.click()
  }

  // Choix du fichier → on ouvre l'éditeur. Pas de contrôle de taille ici : l'éditeur réduit
  // et compresse sous la limite (LOGO_MAX_BYTES). Seul le type est filtré en amont.
  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // autorise le re-choix du même fichier
    if (!file) return
    if (!(LOGO_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      setLocalError(t('party.logo.badType'))
      return
    }
    setLocalError(null)
    setPendingFile(file)
    setEditorOpen(true)
  }

  const mutationError = set.error ?? remove.error
  const errorMessage =
    localError ??
    (mutationError instanceof ApiError
      ? (mutationError.violations[0]?.message ?? mutationError.message)
      : mutationError
        ? t('party.logo.uploadError')
        : null)

  // RGPD : anonymisé → avatar figé, aucune retouche possible.
  if (readOnly) {
    return logoUrl ? (
      <img
        src={logoUrl}
        alt=""
        className="h-12 w-auto max-w-32 shrink-0 rounded-md object-contain"
      />
    ) : (
      <span className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-md">
        <FallbackIcon className="size-6" />
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={busy}
            aria-label={t('party.logo.edit')}
            className="group focus-visible:ring-ring relative h-12 shrink-0 rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {logoUrl ? (
              // `object-contain` : la vignette suit la FORME de l'image (le logo n'est
              // jamais amputé ; un logo rond a des coins transparents → s'affiche rond).
              <img
                src={logoUrl}
                alt=""
                className="h-12 w-auto max-w-32 rounded-md object-contain"
              />
            ) : (
              <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-md">
                <FallbackIcon className="size-6" />
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {busy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Camera className="size-5" />
              )}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={pick}>
            <Camera />
            {t('party.logo.change')}
          </DropdownMenuItem>
          {logoUrl ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                setLocalError(null)
                remove.mutate()
              }}
            >
              <Trash2 />
              {t('party.logo.remove')}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={inputRef}
        type="file"
        accept={LOGO_ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={onFile}
      />
      {errorMessage ? (
        <span className="text-destructive max-w-40 text-xs">
          {errorMessage}
        </span>
      ) : null}

      <ImageEditor
        file={pendingFile}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onDone={(edited) => set.mutate(edited)}
        maxBytes={LOGO_MAX_BYTES}
        outputType="image/webp"
        t={t}
      />
    </div>
  )
}
