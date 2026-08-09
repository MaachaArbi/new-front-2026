import * as React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  Check,
  Copy,
  DollarSign,
  FileText,
  Earth,
  Handshake,
  Hash,
  History,
  LayoutGrid,
  ListChecks,
  Mail,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  Users,
  UserX,
  Wallet,
  X,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useI18n } from '@/app/providers/i18n-provider'
import { useAuth } from '@/app/providers/auth-provider'
import { officesOf, officeCountryOf } from '@/shared/auth/me'
import { useReferentials, codeLabel } from '@/shared/referentials'
import { formatMinor } from '@/shared/lib/money'
import './party-detail-page.css'
import {
  Card,
  CardHead,
  Gauge,
  RailGroupTitle,
  RailRow,
  StatValue,
} from '@/shared/ui/panel'
import { RowActions } from '@/shared/ui/row-actions'
import { useDateFormat } from '@/shared/lib/use-date-format'
import { InitialsAvatar } from '@/shared/ui/initials-avatar'
import {
  usePartyAccount,
  usePatchPartyAccount,
  useDeletePartyAccount,
  usePartyAddressMutations,
  usePartyRoleMutations,
  usePartyFunctionMutations,
  useAnonymizePartyAccount,
  usePartyHistory,
  usePartyFinanceMutations,
} from './queries'
import type {
  PartyAccountListItem,
  PartyAddress,
  PartyContactRef,
  PartyOrganizationIdentity,
  PartyPersonIdentity,
  PartyState,
} from './api'
import { ApiError } from '@/shared/api/errors'
import { Badge, BadgeDot } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { PhoneDisplay } from '@/shared/ui/phone-display'
import { CountryDisplay } from '@/shared/ui/country-display'
import { PartyLogoEditor } from './party-logo-editor'
import { PartyCurrencySheet } from './party-currency-sheet'
import { PartyInterlocutorSheet } from './party-interlocutor-sheet'
import { PartyManagerSheet } from './party-manager-sheet'
import { PartyHistoryTab, KNOWN_SUBJECTS } from './party-history-tab'
import { PartyFinanceTab } from './party-finance-tab'
import { PartyDocumentsCard } from './party-documents-card'
import { SkeletonRow } from '@/shared/feedback'
import { TabsContent, TabsTrigger } from '@/shared/ui/tabs'
import { EventPhrase } from '@/shared/ui/timeline'
import { RecordShell } from '@/shared/ui/record-shell'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import { PartyIdentitySheet } from './party-identity-sheet'
import { PartyAddressSheet } from './party-address-sheet'
import { PartyContactSheet } from './party-contact-sheet'
import { PartyParentSheet } from './party-parent-sheet'
import { groupCreditLimits, todayIso } from './credit'

const STATE_BADGE: Record<
  Exclude<PartyState, 'active'>,
  'info' | 'secondary' | 'destructive'
> = { prospect: 'info', disabled: 'secondary', disputed: 'destructive' }

// Couleur des rôles commerciaux (référentiel `roles`) : Client bleu, Fournisseur ambre,
// tout autre code → gris neutre. Pastilles douces (`appearance="light"`).
const ROLE_VARIANT: Record<string, 'info' | 'warning'> = {
  customer: 'info',
  supplier: 'warning',
}

type FieldItem = {
  label: string
  value: React.ReactNode
  /** Précision sous le libellé — d'où vient la valeur, qui la modifie. */
  hint?: string
}

/**
 * Un champ vide s'affiche quand même, avec un tiret.
 *
 * Règle posée par Arbi le 09/08 : masquer un champ nul le rend indiscernable d'un champ
 * que l'API n'expose pas. On ne peut alors ni vérifier qu'un écran est complet, ni
 * savoir ce qu'il reste à renseigner — c'est ce qui a laissé quatre champs invisibles
 * sur cette fiche. Afficher n'est pas inventer : on ne montre que le contrat d'API.
 */
function withDashes(items: FieldItem[]): FieldItem[] {
  return items.map((item) =>
    item.value == null || item.value === ''
      ? { ...item, value: <span className="text-muted-foreground">—</span> }
      : item
  )
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {children}
    </a>
  )
}

/**
 * Page dossier d'un tiers — **hub 360°** (scaffoldé), branchée sur la **fiche
 * enrichie** du back (identité, adresses, groupes, agence mère en 1 appel). Le vide
 * est un **état de design** : champs/sections sans donnée **masqués**. Robuste par
 * URL ; en venant de la liste, la ligne est passée pour un en-tête riche immédiat.
 */
export function PartyDetailPage() {
  const { t } = useI18n()
  const { me } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { publicId } = useParams<{ publicId: string }>()
  const id = publicId ?? ''
  const patch = usePatchPartyAccount(id)
  const del = useDeletePartyAccount()
  const [editingName, setEditingName] = React.useState(false)
  const [nameDraft, setNameDraft] = React.useState('')
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [identityOpen, setIdentityOpen] = React.useState(false)
  const [contactSheetOpen, setContactSheetOpen] = React.useState(false)
  // Rail « Détails société » : repli du bloc entier + divulgation des sections secondaires.
  // Onglet actif contrôlé : « Voir tout » (Activité récente) bascule vers Historique.
  const [tab, setTab] = React.useState('overview')
  const [parentOpen, setParentOpen] = React.useState(false)
  const [addressSheetOpen, setAddressSheetOpen] = React.useState(false)
  const [editingAddress, setEditingAddress] =
    React.useState<PartyAddress | null>(null)
  const [addressToDelete, setAddressToDelete] =
    React.useState<PartyAddress | null>(null)
  const [currencyOpen, setCurrencyOpen] = React.useState(false)
  const [interlocutorOpen, setInterlocutorOpen] = React.useState(false)
  // Chargés de compte — gérables depuis « Contacts & équipe » (comme la maquette de référence) ;
  // mêmes mutations que l'onglet Finance (source unique côté API).
  const [managerOpen, setManagerOpen] = React.useState(false)
  const [anonymizeOpen, setAnonymizeOpen] = React.useState(false)
  const { remove: removeAddress } = usePartyAddressMutations(id)
  const roleMutations = usePartyRoleMutations(id)
  const functionMutations = usePartyFunctionMutations(id)
  const { manager: managerMutations } = usePartyFinanceMutations(id)
  const anonymize = useAnonymizePartyAccount(id)
  const date = useDateFormat()
  const fmtDate = (iso: string | null) => (iso ? date.day(iso) : null)

  const summary = (location.state as { summary?: PartyAccountListItem } | null)
    ?.summary
  const detailQuery = usePartyAccount(publicId ?? null)
  const detail = detailQuery.data
  const addresses = detail?.addresses ?? []
  const addressesLoading = detailQuery.isLoading
  // Activité récente (Overview) : les 5 dernières entrées d'historique. L'onglet
  // Historique garde sa propre pagination complète.
  const recentHistory = usePartyHistory(publicId ?? '', 1, 5)

  const referentials = useReferentials().data
  const roleLabel = React.useMemo(
    () => codeLabel(referentials?.roles),
    [referentials]
  )
  const legalFormLabel = React.useMemo(
    () => codeLabel(referentials?.legalForms),
    [referentials]
  )
  const addressTypeLabel = React.useMemo(
    () => codeLabel(referentials?.addressTypes),
    [referentials]
  )
  const countryLabel = React.useMemo(
    () => codeLabel(referentials?.countries),
    [referentials]
  )
  const functionLabel = React.useMemo(
    () => codeLabel(referentials?.functions),
    [referentials]
  )
  /**
   * Nom de bureau pour les CHARGÉS DE COMPTE — la seule liste dont l'API ne livre pas
   * encore `officeDisplayName` (les plafonds, exonérations, politiques et règles, si :
   * voir `office-label.ts`). On résout donc via les organisations de l'utilisateur, et
   * à défaut on rend un libellé NEUTRE : la liste de `/me` ne connaît que SES bureaux,
   * un identifiant brut n'apprendrait rien à personne.
   */
  const officeName = React.useCallback(
    (accountId: number | null): string => {
      if (accountId == null) return t('party.finance.allOffices')
      const found = (me ? officesOf(me) : []).find(
        (office) => office.accountId === accountId
      )
      return found ? found.displayName : t('party.finance.otherOffice')
    },
    [me, t]
  )
  // UUID de société (valeur d'audit de l'historique) → nom lisible ; à défaut, l'UUID.
  const officeNameByPublicId = React.useCallback(
    (officePublicId: string): string => {
      const found = (me ? officesOf(me) : []).find(
        (office) => office.publicId === officePublicId
      )
      // Même principe que ci-dessus : à défaut, un libellé neutre plutôt qu'un UUID.
      return found ? found.displayName : t('party.finance.otherOffice')
    },
    [me, t]
  )
  // Bureaux de l'utilisateur (source `/me`) — options des sélecteurs de société finance.
  const officeOptions = React.useMemo(
    () =>
      (me ? officesOf(me) : []).map((office) => ({
        value: office.accountId,
        label: office.displayName,
      })),
    [me]
  )
  const view = {
    nature: detail?.nature ?? summary?.nature,
    displayName: detail?.displayName ?? summary?.displayName ?? '',
    email: detail?.email ?? summary?.email ?? null,
    logoUrl: detail?.logoUrl ?? summary?.logoUrl ?? null,
    phonePrimary: detail?.phonePrimary ?? summary?.phonePrimary ?? null,
    phoneSecondary: detail?.phoneSecondary ?? summary?.phoneSecondary ?? null,
    country: detail?.country ?? summary?.country ?? null,
    roles: detail?.roles ?? summary?.roles ?? [],
    officeScope: detail?.officeScope ?? summary?.officeScope ?? 'undeclared',
    // Le résumé de liste ne porte pas `relationType` → offices depuis le détail seul.
    offices: detail?.offices ?? [],
    contacts: detail?.contacts ?? [],
    accountId: detail?.accountId ?? null,
    isDisabled: detail?.isDisabled ?? summary?.isDisabled ?? false,
    isProspect: detail?.isProspect ?? summary?.isProspect ?? false,
    isDisputed: detail?.isDisputed ?? summary?.isDisputed ?? false,
    identity: detail?.identity ?? null,
    parentAccount: detail?.parentAccount ?? null,
    children: detail?.children ?? [],
    groups: detail?.groups ?? [],
    anonymizedAt: detail?.anonymizedAt ?? null,
    emailVerifiedAt: detail?.emailVerifiedAt ?? null,
    documents: detail?.documents ?? [],
    creditLimits: detail?.creditLimits ?? [],
    managers: detail?.managers ?? [],
    taxExemptions: detail?.taxExemptions ?? [],
    commercialPolicies: detail?.commercialPolicies ?? [],
    approvalRules: detail?.approvalRules ?? [],
    displayCurrencyCode: detail?.displayCurrencyCode ?? null,
    billingCurrencyCode: detail?.billingCurrencyCode ?? null,
    createdAt: detail?.createdAt ?? null,
    updatedAt: detail?.updatedAt ?? null,
  }

  const notFound =
    detailQuery.error instanceof ApiError && detailQuery.error.isNotFound
  const requestId =
    detailQuery.error instanceof ApiError ? detailQuery.error.requestId : null

  // Breadcrumb allégé : discret, gris, ne concurrence pas le titre (§ passe design).
  const backButton = (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="text-muted-foreground hover:text-foreground -ms-0.5 inline-flex w-fit items-center gap-1 text-xs transition-colors"
    >
      <ArrowLeft className="size-3.5" />
      {t('party.detail.back')}
    </button>
  )

  if (detailQuery.isLoading && !summary) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-7.5">
        {backButton}
        <div className="border-border flex flex-col gap-3 rounded-xl border p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonRow key={index} columns={2} />
          ))}
        </div>
      </div>
    )
  }

  if (detailQuery.isError && !summary) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-7.5">
        {backButton}
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 rounded-xl border p-6"
        >
          <p className="text-destructive text-sm">
            {notFound ? t('party.detail.notFound') : t('party.error')}
          </p>
          {requestId && !notFound ? (
            <p className="text-muted-foreground mt-1 text-xs">
              {t('error.requestId')} {requestId}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  const person =
    view.nature === 'person'
      ? (view.identity as PartyPersonIdentity | null)
      : null
  const organization =
    view.nature === 'organization'
      ? (view.identity as PartyOrganizationIdentity | null)
      : null

  const states: Exclude<PartyState, 'active'>[] = []
  if (view.isProspect) states.push('prospect')
  if (view.isDisputed) states.push('disputed')
  if (view.isDisabled) states.push('disabled')

  // Statut = pastille douce à point coloré (le point hérite `currentColor` du variant,
  // donc juste en clair comme en sombre). « Actif » quand aucun état particulier.
  const stateBadges =
    states.length === 0 ? (
      <Badge variant="success" appearance="light" size="md">
        <BadgeDot />
        {t('party.state.active')}
      </Badge>
    ) : (
      states.map((s) => (
        <Badge key={s} variant={STATE_BADGE[s]} appearance="light" size="md">
          <BadgeDot />
          {t(`party.state.${s}`)}
        </Badge>
      ))
    )

  // Sections Détails — construites en données, vides masqués.
  // Carte « Identité » de l'Aperçu = identifiants légaux SEULEMENT. Nature + Site web
  // vivent au rail → pas de doublon (points 7 & 8).
  const identityItems = withDashes(
    view.nature === 'person'
      ? [
          {
            label: t('party.detail.field.firstName'),
            value: person?.firstName,
          },
          { label: t('party.detail.field.lastName'), value: person?.lastName },
          {
            label: t('party.detail.field.employeeRef'),
            value: person?.employeeReference,
          },
        ]
      : [
          // Le matricule fiscal est AUSSI dans la ligne méta de l'en-tête — mais un
          // résumé n'est pas un domicile : il doit exister là où on le modifie.
          { label: t('party.detail.field.taxId'), value: organization?.taxId },
          {
            label: t('party.detail.field.tradeRegister'),
            value: organization?.tradeRegister,
          },
          {
            label: t('party.detail.field.legalForm'),
            value: organization?.legalFormCode
              ? legalFormLabel(organization.legalFormCode)
              : null,
          },
          // Le site web était AFFICHÉ dans Coordonnées et MODIFIÉ par le crayon
          // Identité : le crayon des coordonnées ne faisait pas ce qu'il annonçait.
          // C'est l'affichage qui bouge, pas le champ — le site web est enregistré par
          // l'endpoint identité, et un panneau qui écrirait sur deux endpoints pourrait
          // échouer à moitié sur un formulaire que l'utilisateur croit indivisible.
          {
            label: t('party.detail.field.website'),
            value: organization?.website ? (
              <Ext href={organization.website}>
                {organization.website.replace(/^https?:\/\//, '')}
              </Ext>
            ) : null,
          },
          // Codes comptables : renvoyés par l'API, définis dans l'export comptable et
          // non modifiables ici. Affichés pour que rien de ce que l'API expose ne reste
          // invisible ; le sous-titre dit d'où ils viennent.
          {
            label: t('party.detail.field.accountingAccount'),
            value: organization?.accountingAccountCode,
            hint: t('party.detail.field.accountingHint'),
          },
          {
            label: t('party.detail.field.thirdPartyAccount'),
            value: organization?.thirdPartyAccountCode,
            hint: t('party.detail.field.accountingHint'),
          },
        ]
  )

  // Devises : `null` n'est pas « vide » mais « suit le défaut du bureau » — libellé dédié.
  const currencyDefault = (
    <span className="text-muted-foreground text-sm">
      {t('party.detail.currencyDefault')}
    </span>
  )

  const parent = view.parentAccount

  const availableRoles = (referentials?.roles ?? []).filter(
    (r) => !view.roles.includes(r.code)
  )
  const interlocutorErr = functionMutations.revoke.error
  const interlocutorError =
    interlocutorErr instanceof ApiError ? interlocutorErr.message : null

  // RGPD : tiers anonymisé → formulaire FERMÉ (aucune édition), bandeau, action retirée.
  const editable = view.anonymizedAt == null
  const officeCountry = me ? officeCountryOf(me) : null

  // « À traiter » (conformité + finance) — agrégé depuis les données DÉJÀ chargées,
  // aucune requête en plus. Portée restreinte (décision produit) ; panneau masqué si vide.
  const now = new Date()
  const daysUntil = (iso: string) =>
    Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000)
  // Format de la maquette de référence : point de sévérité (rose/amber) + texte + action (CTA) qui mène là
  // où on résout l'alerte. `onCta` absent = pas d'action (ex. e-mail : vérif = module Core).
  const todoAlerts: {
    key: string
    sev: 'rose' | 'amber'
    text: React.ReactNode
    cta?: string
    onCta?: () => void
  }[] = []
  if (view.email && !view.emailVerifiedAt) {
    todoAlerts.push({
      key: 'email',
      sev: 'rose',
      text: t('party.todo.emailUnverified'),
    })
  }
  const exoNoCert = view.taxExemptions.filter((e) => !e.hasCertificate).length
  if (exoNoCert > 0) {
    todoAlerts.push({
      key: 'exo',
      sev: 'rose',
      text: t('party.todo.exemptionNoCertificate', { count: exoNoCert }),
      cta: t('party.todo.cta.addCertificate'),
      onCta: () => setTab('finance'),
    })
  }
  view.approvalRules
    .filter((r) => !r.validatorStillQualified)
    .forEach((r) =>
      todoAlerts.push({
        key: `val-${r.publicId}`,
        sev: 'rose',
        text: t('party.todo.validatorUnqualified', {
          name: r.validatorDisplayName,
        }),
        cta: t('party.todo.cta.replace'),
        onCta: () => setTab('finance'),
      })
    )
  view.creditLimits
    .filter((c) => c.isExtension && c.validTo)
    .map((c) => ({ c, d: daysUntil(c.validTo as string) }))
    .filter(({ d }) => d <= 30)
    .sort((a, b) => a.d - b.d)
    .forEach(({ c, d }) =>
      todoAlerts.push({
        key: `ext-${c.publicId}`,
        sev: d < 0 ? 'rose' : 'amber',
        text: t(
          d < 0
            ? 'party.todo.extensionExpired'
            : 'party.todo.extensionExpiring',
          { date: fmtDate(c.validTo) ?? '' }
        ),
        cta: t('party.todo.cta.view'),
        onCta: () => setTab('finance'),
      })
    )

  // Plafond effectif du rail : MÊME fonction que l'onglet Finance. Le calcul vivait en
  // double ; les deux se sont contredits à l'écran dès qu'on a corrigé un seul côté.
  const railServiceLabel = codeLabel(referentials?.serviceTypes)
  const creditGroups = groupCreditLimits(view.creditLimits, todayIso())

  // Localisation du rail (reproduction de la maquette de référence) — l'adresse principale, sinon la 1re.
  const primaryAddress = addresses.find((a) => a.isPrimary) ?? addresses[0]
  const railLocation = primaryAddress
    ? [primaryAddress.line1, primaryAddress.city].filter(Boolean).join(', ')
    : null
  const copyText = (text: string) => {
    void navigator.clipboard?.writeText(text)
  }

  // Activité récente — libellé du sujet réutilisé de l'onglet Historique (garde-fou
  // KNOWN_SUBJECTS : sujet inconnu → code brut). Verbe = participe (`op.*`).
  const recentEntries = recentHistory.data?.data ?? []

  // Ligne méta de l'en-tête — uniquement des données réelles déjà chargées.
  const headerMeta: string[] = []
  if (organization?.taxId) headerMeta.push(organization.taxId)
  if (view.roles.length > 0)
    headerMeta.push(view.roles.map((c) => roleLabel(c)).join(' · '))
  if (view.offices.length > 0)
    headerMeta.push(
      Array.from(new Set(view.offices.map((o) => o.displayName))).join(' · ')
    )
  else if (view.officeScope === 'all_offices')
    headerMeta.push(t('party.offices.all'))
  if (view.updatedAt) {
    const who = recentEntries[0]?.actor?.displayName
    headerMeta.push(
      who
        ? t('party.detail.modifiedByRel', {
            when: date.relative(view.updatedAt),
            who,
          })
        : t('party.detail.modifiedRel', { when: date.relative(view.updatedAt) })
    )
  }
  const subjectLabel = (subject: string) =>
    KNOWN_SUBJECTS.has(subject)
      ? t(`party.history.subject.${subject}`)
      : subject
  const fmtActivity = date.short

  const anonymizeError =
    anonymize.error instanceof ApiError
      ? anonymize.error.isConflict
        ? t('party.detail.anonymize.already')
        : anonymize.error.message
      : null
  const removeInterlocutor = (contact: PartyContactRef) => {
    if (view.accountId == null) return
    functionMutations.revoke.mutate({
      personPublicId: contact.publicId,
      organizationAccountId: view.accountId,
      functionCode: contact.functionCode,
    })
  }

  const saveName = () => {
    const next = nameDraft.trim()
    if (next)
      patch.mutate(
        { displayName: next },
        { onSuccess: () => setEditingName(false) }
      )
  }

  return (
    <>
      <RecordShell
        banner={
          <>
            {/* La fiche a échoué mais la LISTE était en cache : sans ce bandeau, on
                afficherait le nom du tiers au-dessus de sections vides, et un agent
                conclurait « ce client n'a ni plafond ni adresse ». Un écran incomplet
                doit se dénoncer — c'est plus grave qu'une page d'erreur franche. */}
            {detailQuery.isError ? (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive mx-4 mb-2 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm lg:mx-7.5"
              >
                <AlertTriangle className="size-4 shrink-0" />
                <span>
                  {notFound
                    ? t('party.detail.notFound')
                    : t('party.detail.partialLoad')}
                </span>
                {requestId && !notFound ? (
                  <span className="text-destructive/70 text-xs">
                    {t('error.requestId')} {requestId}
                  </span>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  className="ms-auto"
                  onClick={() => void detailQuery.refetch()}
                >
                  {t('common.retry')}
                </Button>
              </div>
            ) : null}
            {/* Bandeau RGPD — tiers anonymisé : formulaire fermé, aucune édition. */}
            {!editable ? (
              <div className="border-destructive/30 bg-destructive/10 text-destructive mx-4 flex items-center gap-2 rounded-md border px-3 py-2 text-sm lg:mx-7.5">
                <UserX className="size-4 shrink-0" />
                <span>
                  {t('party.detail.anonymized.banner', {
                    date: fmtDate(view.anonymizedAt) ?? '',
                  })}
                </span>
              </div>
            ) : null}
          </>
        }
        back={backButton}
        avatar={
          <PartyLogoEditor
            publicId={id}
            logoUrl={view.logoUrl}
            nature={view.nature}
            readOnly={!editable}
            t={t}
          />
        }
        title={
          editingName ? (
            <div className="flex items-center gap-2">
              <Input
                className="h-8 max-w-xs"
                value={nameDraft}
                autoFocus
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                aria-label={t('party.detail.rename')}
              />
              <Button
                size="sm"
                mode="icon"
                variant="ghost"
                onClick={saveName}
                disabled={patch.isPending}
              >
                <Check />
              </Button>
              <Button
                size="sm"
                mode="icon"
                variant="ghost"
                onClick={() => setEditingName(false)}
              >
                <X />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-foreground truncate text-xl font-semibold">
                {view.displayName}
              </h1>
              {editable ? (
                <Button
                  size="sm"
                  mode="icon"
                  variant="ghost"
                  className="text-muted-foreground shrink-0"
                  onClick={() => {
                    setNameDraft(view.displayName)
                    setEditingName(true)
                  }}
                  aria-label={t('party.detail.rename')}
                >
                  <Pencil />
                </Button>
              ) : null}
            </>
          )
        }
        badges={editingName ? null : stateBadges}
        meta={editingName ? undefined : headerMeta}
        actions={
          <>
            {editable ? (
              <Button size="sm">
                <Plus />
                {t('party.detail.newBooking')}
              </Button>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  mode="icon"
                  aria-label={t('party.detail.actions')}
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                {editable ? (
                  <>
                    <DropdownMenuCheckboxItem
                      checked={view.isProspect}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(v) => patch.mutate({ isProspect: !!v })}
                    >
                      {t('party.state.prospect')}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={view.isDisputed}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(v) => patch.mutate({ isDisputed: !!v })}
                    >
                      {t('party.state.disputed')}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={view.isDisabled}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(v) => patch.mutate({ isDisabled: !!v })}
                    >
                      {t('party.state.disabled')}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 />
                  {t('party.detail.action.delete')}
                </DropdownMenuItem>
                {editable ? (
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                      anonymize.reset()
                      setAnonymizeOpen(true)
                    }}
                  >
                    <UserX />
                    {t('party.detail.action.anonymize')}
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        value={tab}
        onValueChange={setTab}
        tabs={
          <>
            <TabsTrigger value="overview">
              <LayoutGrid />
              {t('party.detail.tab.overview')}
            </TabsTrigger>
            <TabsTrigger value="finance">
              <Wallet />
              {t('party.detail.tab.finance')}
            </TabsTrigger>
            <TabsTrigger value="history">
              <History />
              {t('party.detail.tab.history')}
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users />
              {t('party.detail.tab.team')}
            </TabsTrigger>
            {/* Notes / Tâches — features sans back : onglets GRISÉS + repère « Soon »
                pour ne pas les oublier (voir docs/backlog/en-attente-donnees). */}
            <TabsTrigger value="notes" disabled>
              <StickyNote />
              {t('party.detail.tab.notes')}
              <Badge variant="secondary" appearance="light" size="xs">
                {t('common.soon')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="tasks" disabled>
              <ListChecks />
              {t('party.detail.tab.tasks')}
              <Badge variant="secondary" appearance="light" size="xs">
                {t('common.soon')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText />
              {t('party.detail.tab.documents')}
            </TabsTrigger>
            {/* Onglets futurs (Réservations/Paiements/Factures) retirés : ils débordaient
                sur le rail, et le « à venir » est déjà signalé dans la Vue d'ensemble.
                À rétablir quand les modules existent. */}
          </>
        }
        railTitle={t(
          view.nature === 'person'
            ? 'party.detail.section.personDetails'
            : 'party.detail.section.companyDetails'
        )}
        rail={
          <>
            {/* Rail reproduit de la maquette de référence : FINANCE → COORDONNÉES → IDENTITÉ.
                Valeurs à droite ; crayons d'édition portés par les titres de groupe. */}
            <div className="text-sm">
              {/* Pas de crayon sur ce titre : le groupe est occupé par des valeurs
                  CALCULÉES — plafond effectif, encours, crédit disponible — qu'aucun
                  formulaire ne modifie. Un crayon devant un plafond de crédit laisse
                  croire qu'on peut le corriger à la main. Il descend sur les devises,
                  la seule chose qu'il modifie réellement. */}
              <RailGroupTitle title={t('party.detail.tab.finance')} />
              {/* CRÉDIT — le chiffre le plus cher de la fiche traité comme un
                  chiffre (pas une ligne parmi d'autres), avec sa jauge d'usage.
                  L'encours n'existe pas encore → jauge en attente, jamais un faux %. */}
              <Card className="mt-1 mb-4">
                <CardHead
                  icon={<Wallet />}
                  title={t('party.finance.creditLimits')}
                />
                <div className="flex flex-col gap-3.5 p-4">
                  {creditGroups.length > 0 ? (
                    creditGroups.map((g) => (
                      <div key={g.key}>
                        <div className="text-muted-foreground text-2xs font-semibold tracking-wide uppercase">
                          {t('party.finance.effective')}
                          {' · '}
                          {g.serviceTypeCode
                            ? railServiceLabel(g.serviceTypeCode)
                            : t('party.finance.allServices')}
                        </div>
                        <StatValue
                          value={formatMinor(
                            g.effectiveMinor,
                            g.currencyCode ?? ''
                          )}
                          unit={g.currencyCode ?? undefined}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-2sm">—</p>
                  )}
                  <Gauge
                    label={t('party.finance.encours')}
                    pending
                    pendingLabel={t('party.detail.pending')}
                  />
                  <div className="text-2sm flex items-baseline justify-between gap-2">
                    <span className="text-muted-foreground">
                      {t('party.finance.availableCredit')}
                    </span>
                    <Badge variant="secondary" appearance="light" size="sm">
                      {t('party.detail.pending')}
                    </Badge>
                  </div>
                </div>
              </Card>

              <RailGroupTitle
                title={t('party.detail.section.currencies')}
                action={
                  editable ? (
                    <Button
                      size="sm"
                      mode="icon"
                      variant="ghost"
                      className="text-muted-foreground shrink-0"
                      onClick={() => setCurrencyOpen(true)}
                      aria-label={t('party.detail.editCurrencies')}
                    >
                      <Pencil />
                    </Button>
                  ) : undefined
                }
              />
              <RailRow
                icon={<DollarSign />}
                label={t('party.detail.currencyDisplay')}
              >
                {view.displayCurrencyCode ?? currencyDefault}
              </RailRow>
              <RailRow
                icon={<DollarSign />}
                label={t('party.detail.currencyBilling')}
              >
                {view.billingCurrencyCode ?? currencyDefault}
              </RailRow>

              <RailGroupTitle
                title={t('party.detail.section.coordinates')}
                action={
                  editable ? (
                    <Button
                      size="sm"
                      mode="icon"
                      variant="ghost"
                      className="text-muted-foreground shrink-0"
                      onClick={() => setContactSheetOpen(true)}
                      aria-label={t('party.detail.editCoordinates')}
                    >
                      <Pencil />
                    </Button>
                  ) : undefined
                }
              />
              <RailRow icon={<Phone />} label={t('party.column.phone')}>
                {view.phonePrimary || view.phoneSecondary ? (
                  <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
                    {view.phonePrimary ? (
                      <span className="inline-flex items-center gap-1">
                        <PhoneDisplay value={view.phonePrimary} />
                        <button
                          type="button"
                          onClick={() => copyText(view.phonePrimary ?? '')}
                          aria-label={t('common.copy')}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </span>
                    ) : null}
                    {view.phoneSecondary ? (
                      <span className="inline-flex items-center gap-1">
                        <PhoneDisplay value={view.phoneSecondary} />
                        <button
                          type="button"
                          onClick={() => copyText(view.phoneSecondary ?? '')}
                          aria-label={t('common.copy')}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </RailRow>
              <RailRow icon={<Mail />} label={t('party.detail.email')}>
                {view.email ? (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <Ext href={`mailto:${view.email}`}>{view.email}</Ext>
                    <Badge
                      variant={view.emailVerifiedAt ? 'success' : 'warning'}
                      appearance="light"
                      size="sm"
                    >
                      {view.emailVerifiedAt
                        ? t('party.detail.emailVerified')
                        : t('party.detail.emailNotVerified')}
                    </Badge>
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </RailRow>
              <RailRow icon={<MapPin />} label={t('party.detail.location')}>
                {railLocation ? (
                  <span className="text-foreground">{railLocation}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </RailRow>
              {/* Le pays du TIERS est un champ à lui, modifiable depuis Coordonnées.
                  Il servait de repli à « Localisation » : dès qu'une adresse existait,
                  on le modifiait sans jamais le revoir. Ligne propre désormais. */}
              <RailRow icon={<Earth />} label={t('party.column.country')}>
                {view.country ? (
                  <CountryDisplay code={view.country} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </RailRow>

              <RailGroupTitle title={t('party.detail.section.identity')} />
              <RailRow icon={<Building2 />} label={t('party.column.nature')}>
                {t(`party.nature.${view.nature}`)}
              </RailRow>
              <RailRow icon={<Handshake />} label={t('party.column.roles')}>
                <span className="flex flex-wrap gap-1">
                  {view.roles.map((code) => (
                    <Badge
                      key={code}
                      variant={ROLE_VARIANT[code] ?? 'secondary'}
                      appearance="light"
                      size="sm"
                      className="gap-1 pe-1"
                    >
                      {roleLabel(code)}
                      {editable ? (
                        <button
                          type="button"
                          onClick={() => roleMutations.revoke.mutate(code)}
                          aria-label={t('party.detail.removeRole')}
                          className="text-muted-foreground hover:text-foreground rounded-sm"
                        >
                          <X className="size-3" />
                        </button>
                      ) : null}
                    </Badge>
                  ))}
                  {editable && availableRoles.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={t('party.detail.addRole')}
                          className="text-muted-foreground hover:text-foreground border-border rounded-sm border border-dashed px-1"
                        >
                          <Plus className="size-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-44">
                        {availableRoles.map((role) => (
                          <DropdownMenuItem
                            key={role.code}
                            onSelect={() =>
                              roleMutations.assign.mutate(role.code)
                            }
                          >
                            {role.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </span>
              </RailRow>

              {/* Adresses — déplacées ici (hors la maquette de référence Overview). Édition conservée. */}
              <RailGroupTitle
                title={t('party.detail.addresses')}
                action={
                  editable ? (
                    <Button
                      size="sm"
                      mode="icon"
                      variant="ghost"
                      className="text-muted-foreground shrink-0"
                      onClick={() => {
                        setEditingAddress(null)
                        setAddressSheetOpen(true)
                      }}
                      aria-label={t('party.detail.addAddress')}
                    >
                      <Plus />
                    </Button>
                  ) : undefined
                }
              />
              {addressesLoading ? (
                <SkeletonRow columns={1} />
              ) : addresses.length > 0 ? (
                <div className="flex flex-col gap-3 py-1">
                  {addresses.map((address) => (
                    <div
                      key={address.publicId}
                      className="flex items-start justify-between gap-2"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="flex items-center gap-2">
                          <span className="text-foreground text-sm font-medium">
                            {addressTypeLabel(address.addressType)}
                          </span>
                          {address.isPrimary ? (
                            <Badge variant="secondary" size="xs">
                              {t('party.address.primary')}
                            </Badge>
                          ) : null}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {[
                            address.line1,
                            address.line2,
                            [address.postalCode, address.city]
                              .filter(Boolean)
                              .join(' '),
                            address.countryAlpha2
                              ? countryLabel(address.countryAlpha2)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                      {editable ? (
                        <RowActions
                          onEdit={() => {
                            setEditingAddress(address)
                            setAddressSheetOpen(true)
                          }}
                          editLabel={t('party.detail.editAddress')}
                          onRemove={() => setAddressToDelete(address)}
                          removeLabel={t('party.detail.action.delete')}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState className="px-0">
                  {t('party.detail.noAddresses')}
                </EmptyState>
              )}
            </div>

            {/* TECHNIQUE — identifiants renvoyés par l'API, en lecture seule.
                Ils ne servent pas au travail quotidien, mais ils rendent une fiche
                identifiable au téléphone avec le support, et le numéro de compte
                explique les « #119751 » qui apparaissent en Finance quand un bureau
                sort du périmètre de l'utilisateur connecté. */}
            <div className="mt-5 text-sm">
              <RailGroupTitle title={t('party.detail.section.technical')} />
              <RailRow
                icon={<Hash />}
                label={t('party.detail.field.reference')}
              >
                <button
                  type="button"
                  onClick={() => copyText(id)}
                  className="text-muted-foreground hover:text-foreground inline-flex items-start gap-1.5 text-end font-mono text-[11px] break-all"
                  aria-label={t('common.copy')}
                >
                  {id}
                  <Copy className="mt-0.5 size-3 shrink-0" />
                </button>
              </RailRow>
              {view.accountId != null ? (
                <RailRow
                  icon={<Hash />}
                  label={t('party.detail.field.accountNumber')}
                >
                  <span className="text-muted-foreground font-mono text-xs tabular-nums">
                    #{view.accountId}
                  </span>
                </RailRow>
              ) : null}
            </div>
          </>
        }
        footer={
          view.createdAt || view.updatedAt ? (
            <p className="text-muted-foreground px-4 text-xs lg:px-7.5">
              {view.createdAt
                ? t('party.detail.createdOn', {
                    date: fmtDate(view.createdAt) ?? '',
                  })
                : null}
              {view.createdAt && view.updatedAt ? ' · ' : null}
              {view.updatedAt
                ? t('party.detail.updatedOn', {
                    date: fmtDate(view.updatedAt) ?? '',
                  })
                : null}
            </p>
          ) : null
        }
      >
        <TabsContent value="overview" className="flex flex-col gap-4 pt-4">
          {/* « À traiter » (reproduction de la maquette de référence) — en-tête + compteur, puis lignes
              point de sévérité + texte + ACTION. Alertes réelles ; masqué si rien. */}
          {todoAlerts.length > 0 ? (
            <Card>
              <CardHead
                icon={<AlertTriangle />}
                title={t('party.todo.title')}
                tone="urgent"
                action={
                  <Badge variant="warning" appearance="light" size="sm">
                    {todoAlerts.length}
                  </Badge>
                }
              />
              <div>
                {todoAlerts.map((a) => (
                  <div
                    key={a.key}
                    className="border-border/60 hover:bg-strip text-2sm flex items-center justify-between gap-3 border-b px-4 py-3 transition-colors last:border-0"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          'size-2 shrink-0 rounded-full',
                          a.sev === 'rose' ? 'bg-rose-500' : 'bg-amber-500'
                        )}
                      />
                      <span className="text-foreground truncate">{a.text}</span>
                    </span>
                    {a.cta ? (
                      <button
                        type="button"
                        onClick={a.onCta}
                        className="text-primary shrink-0 text-sm font-medium hover:underline"
                      >
                        {a.cta}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Aperçu (reproduction de la maquette de référence) : Identité (identifiants légaux) +
              Rattachements (bureau · agence mère · agences filles) — données réelles. */}
          <div>
            <div className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold">
              <LayoutGrid className="text-muted-foreground size-4" />
              {t('party.detail.overview.summary')}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border-border rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-foreground text-sm font-semibold">
                    {t('party.detail.section.identity')}
                  </span>
                  {editable ? (
                    <Button
                      size="sm"
                      mode="icon"
                      variant="ghost"
                      className="text-muted-foreground shrink-0"
                      onClick={() => setIdentityOpen(true)}
                      aria-label={t('party.detail.editIdentity')}
                    >
                      <Pencil />
                    </Button>
                  ) : null}
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  {identityItems.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-muted-foreground flex flex-col">
                        {it.label}
                        {it.hint ? (
                          <span className="text-muted-foreground/70 text-xs">
                            {it.hint}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-foreground text-end font-medium">
                        {it.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-border rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-foreground text-sm font-semibold">
                    {t('party.detail.overview.attachments')}
                  </span>
                  {editable && view.nature === 'organization' ? (
                    <Button
                      size="sm"
                      mode="icon"
                      variant="ghost"
                      className="text-muted-foreground shrink-0"
                      onClick={() => setParentOpen(true)}
                      aria-label={t('party.detail.editParent')}
                    >
                      <Pencil />
                    </Button>
                  ) : null}
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  {view.offices.map((o) => (
                    <div
                      key={`${o.publicId}-${o.relationType}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-muted-foreground">
                        {t('party.detail.overview.office')}
                      </span>
                      <span className="text-foreground inline-flex items-center gap-2 font-medium">
                        {o.displayName}
                        <Badge variant="secondary" appearance="light" size="sm">
                          {roleLabel(o.relationType)}
                        </Badge>
                      </span>
                    </div>
                  ))}
                  {/* Agence mère, agences filles et groupes s'affichent MÊME vides :
                      un rattachement absent doit se distinguer d'un rattachement que
                      la fiche ne gère pas. */}
                  {view.nature === 'organization' ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">
                          {t('party.detail.overview.parent')}
                        </span>
                        {parent ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/parties/${parent.publicId}`)
                            }
                            className="text-primary font-medium hover:underline"
                          >
                            {parent.displayName}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">
                          {t('party.detail.overview.children')}
                        </span>
                        {view.children.length > 0 ? (
                          <Badge
                            variant="secondary"
                            appearance="light"
                            size="sm"
                            className="gap-1"
                          >
                            <Users className="size-3.5" />
                            {t('party.detail.overview.childrenCount', {
                              count: view.children.length,
                            })}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </>
                  ) : null}
                  {/* Portée « tous les bureaux » : sans ça, un tiers rattaché à TOUS
                      les bureaux affichait une carte vide (donnée perdue au report). */}
                  {view.offices.length === 0 &&
                  view.officeScope === 'all_offices' ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">
                        {t('party.column.offices')}
                      </span>
                      <span className="text-foreground font-medium">
                        {t('party.offices.all')}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">
                      {t('party.detail.section.groups')}
                    </span>
                    {view.groups.length > 0 ? (
                      <span className="flex flex-wrap justify-end gap-1">
                        {view.groups.map((group) => (
                          <Badge
                            key={group.publicId}
                            variant="secondary"
                            appearance="light"
                            size="sm"
                          >
                            {group.name}
                          </Badge>
                        ))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activité récente (style maquette de référence) — en-tête à icône + « Voir tout », puis
              conteneur bordé à lignes : point + « qui · quoi » + date. */}
          <Card>
            <CardHead
              icon={<Activity />}
              title={t('party.detail.activity.title')}
              action={
                <button
                  type="button"
                  onClick={() => setTab('history')}
                  className="text-primary text-2sm font-medium hover:underline"
                >
                  {t('party.detail.activity.seeAll')}
                </button>
              }
            />
            {recentHistory.isLoading ? (
              <SkeletonRow columns={1} />
            ) : recentEntries.length > 0 ? (
              <div>
                {recentEntries.map((entry, i) => (
                  <div
                    key={`${entry.at}-${i}`}
                    className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3 text-sm last:border-0"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="bg-muted-foreground/40 size-2 shrink-0 rounded-full" />
                      <EventPhrase
                        className="truncate"
                        actor={entry.actor?.displayName ?? '—'}
                        parts={[
                          subjectLabel(entry.subject),
                          t(`party.history.op.${entry.operation}`),
                        ]}
                      />
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {fmtActivity(entry.at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>{t('party.detail.activity.empty')}</EmptyState>
            )}
            <p className="text-muted-foreground/70 border-border text-2xs border-t px-4 py-2.5">
              {t('party.detail.soon.body')}
            </p>
          </Card>

          {/* Interlocuteurs (style maquette de référence) — avatar + nom + fonction, conteneur bordé.
              « Voir tout » → onglet Contacts & équipe. Pas de tél/e-mail (donnée absente
              sur le lien contact) : clic → fiche de l'interlocuteur. */}
          {view.nature === 'organization' && view.contacts.length > 0 ? (
            <Card>
              <CardHead
                icon={<Users />}
                title={t('party.detail.section.contacts')}
                count={view.contacts.length}
                action={
                  <button
                    type="button"
                    onClick={() => setTab('team')}
                    className="text-primary text-2sm font-medium hover:underline"
                  >
                    {t('party.detail.activity.seeAll')}
                  </button>
                }
              />
              <div>
                {view.contacts.map((contact) => (
                  <button
                    key={contact.publicId}
                    type="button"
                    onClick={() => navigate(`/parties/${contact.publicId}`)}
                    className="hover:bg-accent border-border/60 flex w-full items-center gap-3 border-b px-4 py-3 text-start last:border-0"
                  >
                    <InitialsAvatar name={contact.displayName} />
                    <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
                      {contact.displayName}
                    </span>
                    <Badge variant="secondary" appearance="light" size="sm">
                      {functionLabel(contact.functionCode)}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Chargés de compte (style maquette de référence) — avatar + nom + affectation + bureau. */}
          {view.managers.length > 0 ? (
            <Card>
              <CardHead
                icon={<Briefcase />}
                title={t('party.finance.managers')}
                count={view.managers.length}
              />
              <div>
                {view.managers.map((m) => (
                  <div
                    key={m.publicId}
                    className="border-border/60 flex items-center gap-3 border-b px-4 py-3 text-sm last:border-0"
                  >
                    <InitialsAvatar name={m.managerDisplayName} />
                    <span className="text-foreground min-w-0 flex-1 truncate font-medium">
                      {m.managerDisplayName}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {t(`party.finance.assignment.${m.assignmentType}`)}
                    </span>
                    <Badge variant="secondary" appearance="light" size="sm">
                      {officeName(m.officeAccountId)}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="finance" className="pt-4">
          <PartyFinanceTab
            publicId={id}
            editable={editable}
            offices={officeOptions}
            currencies={referentials?.currencies ?? []}
            serviceTypes={referentials?.serviceTypes ?? []}
            functions={referentials?.functions ?? []}
            creditLimits={view.creditLimits}
            managers={view.managers}
            taxExemptions={view.taxExemptions}
            commercialPolicies={view.commercialPolicies}
            approvalRules={view.approvalRules}
            officeName={officeName}
            functionLabel={functionLabel}
            t={t}
          />
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <PartyHistoryTab
            publicId={id}
            officeNameByPublicId={officeNameByPublicId}
            serviceTypeLabel={codeLabel(referentials?.serviceTypes)}
            t={t}
          />
        </TabsContent>

        <TabsContent value="team" className="pt-4">
          {/* INTERLOCUTEURS (externes) — répertoire complet, style maquette de référence : en-tête à
              icône + compteur + bouton, puis conteneur bordé (avatar · nom · fonction).
              Pas de tél/e-mail : absents de `PartyContactRef` (demande back). */}
          {view.nature === 'organization' ? (
            <section className="mb-9">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <Users className="text-muted-foreground size-4" />
                  {t('party.detail.section.contacts')}
                  <span className="text-muted-foreground text-xs font-normal">
                    · {t('party.detail.team.contactsHint')} ·{' '}
                    {view.contacts.length}
                  </span>
                </div>
                {editable && view.accountId != null ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setInterlocutorOpen(true)}
                  >
                    <Plus />
                    {t('party.detail.addInterlocutor')}
                  </Button>
                ) : null}
              </div>
              {view.contacts.length > 0 ? (
                <div className="border-border rounded-xl border">
                  {view.contacts.map((contact) => (
                    <div
                      key={contact.publicId}
                      className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/parties/${contact.publicId}`)}
                        className="flex min-w-0 items-center gap-3 text-start"
                      >
                        <InitialsAvatar name={contact.displayName} />
                        <span className="text-foreground truncate font-medium">
                          {contact.displayName}
                        </span>
                        <span className="bg-muted text-muted-foreground shrink-0 rounded px-2 py-0.5 text-xs">
                          {functionLabel(contact.functionCode)}
                        </span>
                      </button>
                      {editable && view.accountId != null ? (
                        <Button
                          size="sm"
                          mode="icon"
                          variant="ghost"
                          className="text-muted-foreground shrink-0"
                          aria-label={t('party.detail.removeInterlocutor')}
                          disabled={functionMutations.revoke.isPending}
                          onClick={() => removeInterlocutor(contact)}
                        >
                          <X />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState>{t('party.detail.noInterlocutor')}</EmptyState>
              )}
              {interlocutorError ? (
                <p className="text-destructive mt-1 text-xs">
                  {interlocutorError}
                </p>
              ) : null}
            </section>
          ) : null}

          {/* CHARGÉS DE COMPTE (internes) — votre équipe sur ce compte. Gérables ici
              (mêmes mutations que l'onglet Finance). */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <Briefcase className="text-muted-foreground size-4" />
                {t('party.finance.managers')}
                <span className="text-muted-foreground text-xs font-normal">
                  · {t('party.detail.team.managersHint')} ·{' '}
                  {view.managers.length}
                </span>
              </div>
              {editable ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setManagerOpen(true)}
                >
                  <Plus />
                  {t('party.finance.addManager')}
                </Button>
              ) : null}
            </div>
            {view.managers.length > 0 ? (
              <div className="border-border rounded-xl border">
                {view.managers.map((m) => (
                  <div
                    key={m.publicId}
                    className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <InitialsAvatar name={m.managerDisplayName} />
                      <span className="text-foreground truncate font-medium">
                        {m.managerDisplayName}
                      </span>
                      <span className="bg-muted text-muted-foreground shrink-0 rounded px-2 py-0.5 text-xs">
                        {t(`party.finance.assignment.${m.assignmentType}`)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-muted-foreground text-sm">
                        {officeName(m.officeAccountId)}
                      </span>
                      {editable ? (
                        <Button
                          size="sm"
                          mode="icon"
                          variant="ghost"
                          className="text-muted-foreground shrink-0"
                          aria-label={t('party.finance.remove')}
                          disabled={managerMutations.remove.isPending}
                          onClick={() =>
                            managerMutations.remove.mutate(m.publicId)
                          }
                        >
                          <X />
                        </Button>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>{t('party.finance.managers.empty')}</EmptyState>
            )}
          </section>
        </TabsContent>

        {/* Notes / Tâches — placeholders (features sans back), reproduits de la maquette de référence. */}
        <TabsContent value="notes" className="pt-4">
          <div className="border-border bg-muted/20 rounded-xl border border-dashed p-6">
            <p className="text-muted-foreground text-sm">
              {t('party.detail.soon.tabBody')}
            </p>
          </div>
        </TabsContent>
        <TabsContent value="tasks" className="pt-4">
          <div className="border-border bg-muted/20 rounded-xl border border-dashed p-6">
            <p className="text-muted-foreground text-sm">
              {t('party.detail.soon.tabBody')}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="pt-4">
          <PartyDocumentsCard
            publicId={id}
            documents={view.documents}
            editable={editable}
            countries={referentials?.countries ?? []}
            t={t}
          />
        </TabsContent>
      </RecordShell>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('party.detail.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('party.detail.delete.body')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t('party.detail.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={del.isPending}
              onClick={() =>
                del.mutate(id, { onSuccess: () => navigate('/parties') })
              }
            >
              {t('party.detail.action.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={anonymizeOpen} onOpenChange={setAnonymizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('party.detail.anonymize.title')}</DialogTitle>
            <DialogDescription>
              {t('party.detail.anonymize.body')}
            </DialogDescription>
          </DialogHeader>
          {anonymizeError ? (
            <p className="text-destructive text-sm">{anonymizeError}</p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnonymizeOpen(false)}>
              {t('party.detail.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={anonymize.isPending}
              onClick={() =>
                anonymize.mutate(undefined, {
                  onSuccess: () => setAnonymizeOpen(false),
                })
              }
            >
              {t('party.detail.action.anonymize')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PartyIdentitySheet
        open={identityOpen}
        onOpenChange={setIdentityOpen}
        publicId={id}
        nature={view.nature}
        identity={view.identity}
        legalForms={referentials?.legalForms ?? []}
        t={t}
      />

      <PartyContactSheet
        open={contactSheetOpen}
        onOpenChange={setContactSheetOpen}
        publicId={id}
        email={view.email}
        phonePrimary={view.phonePrimary}
        phoneSecondary={view.phoneSecondary}
        country={view.country}
        countries={referentials?.countries ?? []}
        defaultCountry={officeCountry ?? undefined}
        t={t}
      />

      <PartyCurrencySheet
        open={currencyOpen}
        onOpenChange={setCurrencyOpen}
        publicId={id}
        displayCurrencyCode={view.displayCurrencyCode}
        billingCurrencyCode={view.billingCurrencyCode}
        currencies={referentials?.currencies ?? []}
        t={t}
      />

      {view.accountId != null ? (
        <PartyInterlocutorSheet
          open={interlocutorOpen}
          onOpenChange={setInterlocutorOpen}
          organizationPublicId={id}
          organizationAccountId={view.accountId}
          functions={referentials?.functions ?? []}
          t={t}
        />
      ) : null}

      <PartyManagerSheet
        open={managerOpen}
        onOpenChange={setManagerOpen}
        publicId={id}
        offices={officeOptions}
        t={t}
      />

      <PartyParentSheet
        open={parentOpen}
        onOpenChange={setParentOpen}
        publicId={id}
        currentParent={view.parentAccount}
        t={t}
      />

      <PartyAddressSheet
        open={addressSheetOpen}
        onOpenChange={setAddressSheetOpen}
        publicId={id}
        address={editingAddress}
        addressTypes={referentials?.addressTypes ?? []}
        countries={referentials?.countries ?? []}
        t={t}
      />

      <Dialog
        open={addressToDelete != null}
        onOpenChange={(open) => {
          if (!open) setAddressToDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('party.detail.deleteAddress')}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressToDelete(null)}>
              {t('party.detail.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={removeAddress.isPending}
              onClick={() => {
                if (addressToDelete)
                  removeAddress.mutate(addressToDelete.publicId, {
                    onSuccess: () => setAddressToDelete(null),
                  })
              }}
            >
              {t('party.detail.action.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
