import * as React from 'react'
import {
  FileText,
  FileX,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CountryDisplay } from '@/shared/ui/country-display'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import type { ReferentialItem } from '@/shared/referentials'
import { usePartyDocumentMutations } from './queries'
import {
  DOCUMENT_ACCEPTED_TYPES,
  DOCUMENT_MAX_BYTES,
  getDocumentReadLink,
  type PartyDocument,
} from './api'
import { PartyDocumentSheet } from './party-document-sheet'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

const KNOWN_TYPES = new Set([
  'passport',
  'cin',
  'driving_license',
  'contract',
  'other',
])

/** Seuil « expire bientôt » — 90 jours avant l'échéance. */
const EXPIRY_SOON_DAYS = 90

/** Statut d'expiration calculé depuis `expiryDate` (null = pièce sans échéance). */
function expiryStatus(
  expiryDate: string | null
): 'valid' | 'expiringSoon' | 'expired' | null {
  if (!expiryDate) return null
  const days = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / 86_400_000
  )
  if (days < 0) return 'expired'
  if (days <= EXPIRY_SOON_DAYS) return 'expiringSoon'
  return 'valid'
}

const STATUS_CLASS: Record<'valid' | 'expiringSoon' | 'expired', string> = {
  valid:
    'bg-[var(--color-success-accent,var(--color-green-100))] text-[var(--color-success-foreground,var(--color-green-800))]',
  expiringSoon:
    'bg-[var(--color-warning-accent,var(--color-yellow-100))] text-[var(--color-warning-foreground,var(--color-yellow-800))]',
  expired: 'bg-destructive/10 text-destructive',
}

/**
 * Carte **Documents** — gestion complète. `hasFile` distingue les pièces **avec / sans scan**
 * (montré en clair). Le fichier vit dans un **seau privé** : on l'ouvre via un **lien signé
 * (5 min)** demandé au clic, **jamais stocké**. Verrouillée si le tiers est anonymisé (`editable`).
 */
export function PartyDocumentsCard({
  publicId,
  documents,
  editable,
  countries,
  t,
}: {
  publicId: string
  documents: readonly PartyDocument[]
  editable: boolean
  countries: readonly ReferentialItem[]
  t: Translate
}) {
  const { remove, setFile, removeFile } = usePartyDocumentMutations(publicId)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const pendingDocId = React.useRef<string | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<PartyDocument | null>(null)
  const [toDelete, setToDelete] = React.useState<PartyDocument | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)

  const typeLabel = (code: string) =>
    KNOWN_TYPES.has(code) ? t(`party.document.type.${code}`) : code

  const openCreate = () => {
    setEditing(null)
    setSheetOpen(true)
  }
  const openEdit = (doc: PartyDocument) => {
    setEditing(doc)
    setSheetOpen(true)
  }

  const pickFile = (doc: PartyDocument) => {
    setFileError(null)
    pendingDocId.current = doc.publicId
    inputRef.current?.click()
  }
  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    const documentPublicId = pendingDocId.current
    if (!file || !documentPublicId) return
    if (!(DOCUMENT_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      setFileError(t('party.document.badType'))
      return
    }
    if (file.size > DOCUMENT_MAX_BYTES) {
      setFileError(t('party.document.tooBig'))
      return
    }
    setFileError(null)
    setFile.mutate({ documentPublicId, file })
  }

  // Seau privé : lien signé demandé au clic, ouvert aussitôt (fenêtre pré-ouverte pour
  // ne pas être bloquée), jamais conservé.
  const openFile = async (doc: PartyDocument) => {
    setFileError(null)
    const win = window.open('', '_blank')
    try {
      const { url } = await getDocumentReadLink(publicId, doc.publicId)
      if (win) win.location.href = url
      else window.location.href = url
    } catch {
      if (win) win.close()
      setFileError(t('party.document.openError'))
    }
  }

  return (
    <div>
      {/* En-tête façon /_ref : icône + titre + compteur, bouton outline à droite. */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <FileText className="text-muted-foreground size-4" />
          {t('party.detail.section.documents')}
          <span className="text-muted-foreground text-xs font-normal">
            · {documents.length}
          </span>
        </div>
        {editable ? (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={openCreate}
          >
            <Plus />
            {t('party.document.add')}
          </Button>
        ) : null}
      </div>

      {documents.length > 0 ? (
        <div className="border-border rounded-xl border">
          {documents.map((doc) => {
            const status = expiryStatus(doc.expiryDate)
            return (
              <div
                key={doc.publicId}
                className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FileText className="text-muted-foreground size-4 shrink-0" />
                  <span className="text-foreground truncate font-medium">
                    {typeLabel(doc.documentType)}
                  </span>
                  {doc.documentNumber ? (
                    <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
                      · n° {doc.documentNumber}
                    </span>
                  ) : null}
                  {doc.issuingCountry ? (
                    <CountryDisplay code={doc.issuingCountry} />
                  ) : null}
                </span>

                <span className="flex shrink-0 items-center gap-3 text-sm">
                  {/* Échéance en clair + statut calculé (valide / bientôt / expiré). */}
                  {doc.expiryDate ? (
                    <span className="text-muted-foreground tabular-nums">
                      {t(
                        status === 'expired'
                          ? 'party.document.expiredOn'
                          : 'party.document.expiresOn',
                        { date: doc.expiryDate }
                      )}
                    </span>
                  ) : doc.issueDate ? (
                    <span className="text-muted-foreground tabular-nums">
                      {t('party.document.issuedOn', { date: doc.issueDate })}
                    </span>
                  ) : null}
                  {status ? (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
                    >
                      {t(`party.document.status.${status}`)}
                    </span>
                  ) : null}

                  {/* Scan : « Voir » si présent, sinon alerte « Sans scan » + Déposer. */}
                  {doc.hasFile ? (
                    <button
                      type="button"
                      onClick={() => openFile(doc)}
                      className="text-primary font-medium hover:underline"
                    >
                      {t('party.document.open')}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span className="shrink-0 rounded-full bg-[var(--color-warning-accent,var(--color-yellow-100))] px-2 py-0.5 text-xs font-medium text-[var(--color-warning-foreground,var(--color-yellow-800))]">
                        {t('party.document.noScan')}
                      </span>
                      {editable ? (
                        <button
                          type="button"
                          onClick={() => pickFile(doc)}
                          disabled={setFile.isPending}
                          className="text-primary font-medium hover:underline"
                        >
                          {t('party.document.deposit')}
                        </button>
                      ) : null}
                    </span>
                  )}
                {editable ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        mode="icon"
                        variant="ghost"
                        className="text-muted-foreground"
                        aria-label={t('party.document.actions')}
                      >
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      <DropdownMenuItem onSelect={() => openEdit(doc)}>
                        <Pencil />
                        {t('party.document.edit')}
                      </DropdownMenuItem>
                      {doc.hasFile ? (
                        <>
                          <DropdownMenuItem onSelect={() => pickFile(doc)}>
                            <Upload />
                            {t('party.document.replace')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => removeFile.mutate(doc.publicId)}
                          >
                            <FileX />
                            {t('party.document.removeFile')}
                          </DropdownMenuItem>
                        </>
                      ) : null}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setToDelete(doc)}
                      >
                        <Trash2 />
                        {t('party.document.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground py-1 text-sm">
          {t('party.document.empty')}
        </p>
      )}

      {fileError ? (
        <p className="text-destructive mt-2 text-xs">{fileError}</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={DOCUMENT_ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={onFile}
      />

      <PartyDocumentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        publicId={publicId}
        document={editing}
        countries={countries}
        t={t}
      />

      <Dialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('party.document.delete')}</DialogTitle>
            <DialogDescription>
              {t('party.document.deleteConfirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              {t('party.detail.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (toDelete) {
                  remove.mutate(toDelete.publicId, {
                    onSuccess: () => setToDelete(null),
                  })
                }
              }}
            >
              {t('party.document.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
