/**
 * EXPORT.
 *
 * ── LA DÉCISION ────────────────────────────────────────────────────────────────
 * Arbi, 04/08 : Excel et PDF gardés, mais **générés côté SERVEUR**, avec les
 * filtres courants. Le motif est le même que pour l'entonnoir par colonne :
 * exporter depuis le navigateur suppose d'avoir toutes les lignes en mémoire —
 * c'est exactement ce qu'on fuit. Un export de 50 000 tiers depuis le client fait
 * tomber l'onglet ; côté serveur, il produit un fichier.
 *
 * ── ÉTAT RÉEL ──────────────────────────────────────────────────────────────────
 * ⚠️ EN ATTENTE : l'endpoint d'export est différé en phase 2. Le bouton est donc
 * VISIBLE et ANNONCÉ comme indisponible, pas masqué — règle du 19/08 : on montre
 * l'écran complet et on marque ce qui manque.
 *
 * Le libellé dit ce que l'export emportera : « avec les filtres courants ». Sans
 * ça, on ne sait pas si on exporte la page, la sélection, ou tout.
 */
import { useIntl } from 'react-intl'
import { Download, FileSpreadsheet, FileText, Lock } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export interface ExportButtonProps {
  /** Passe à `true` le jour où l'endpoint existe. */
  available?: boolean
  onExport?: (format: 'xlsx' | 'pdf') => void
  /** Nombre de lignes que l'export emportera, filtres courants compris. */
  recordCount?: number
}

function ExportButton({
  available = false,
  onExport,
  recordCount,
}: ExportButtonProps) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm">
          <Download />
          {t('ui.list.export')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuLabel className="text-ink-muted font-normal">
          {recordCount === undefined
            ? t('ui.list.exportScope')
            : intl.formatMessage(
                { id: 'ui.list.exportScopeCount' },
                {
                  n: (
                    <span
                      dir="ltr"
                      className="tabular-nums [unicode-bidi:isolate]"
                    >
                      {recordCount}
                    </span>
                  ),
                }
              )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!available}
          onSelect={() => onExport?.('xlsx')}
        >
          <FileSpreadsheet />
          {t('ui.list.exportXlsx')}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!available}
          onSelect={() => onExport?.('pdf')}
        >
          <FileText />
          {t('ui.list.exportPdf')}
        </DropdownMenuItem>
        {!available && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-ink-muted flex items-center gap-1.5 font-normal">
              <Lock className="size-3" />
              {t('ui.list.exportPending')}
            </DropdownMenuLabel>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ExportButton }
