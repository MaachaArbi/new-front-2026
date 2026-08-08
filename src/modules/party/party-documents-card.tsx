import * as React from 'react'
import {
  ExternalLink,
  FileX,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
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
    <div className="border-border rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-foreground text-sm font-semibold">
          {t('party.detail.section.documents')}
        </h3>
        {editable ? (
          <Button size="sm" variant="outline" onClick={openCreate}>
            <Plus />
            {t('party.document.add')}
          </Button>
        ) : null}
      </div>

      {documents.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {documents.map((doc) => (
            <li
              key={doc.publicId}
              className="border-border/60 flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-foreground text-sm font-medium">
                    {typeLabel(doc.documentType)}
                  </span>
                  {doc.documentNumber ? (
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {doc.documentNumber}
                    </span>
                  ) : null}
                  {doc.issuingCountry ? (
                    <CountryDisplay code={doc.issuingCountry} />
                  ) : null}
                  {doc.hasFile ? (
                    <Badge variant="success" size="sm">
                      {t('party.document.withScan')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" size="sm">
                      {t('party.document.noScan')}
                    </Badge>
                  )}
                </div>
                {doc.issueDate || doc.expiryDate ? (
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {t('party.document.dates', {
                      from: doc.issueDate ?? '…',
                      to: doc.expiryDate ?? '…',
                    })}
                  </span>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {doc.hasFile ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openFile(doc)}
                  >
                    <ExternalLink />
                    {t('party.document.open')}
                  </Button>
                ) : editable ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => pickFile(doc)}
                    disabled={setFile.isPending}
                  >
                    <Upload />
                    {t('party.document.deposit')}
                  </Button>
                ) : null}
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
              </div>
            </li>
          ))}
        </ul>
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
