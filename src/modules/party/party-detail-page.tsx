import * as React from 'react'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  History,
  LayoutGrid,
  Mail,
  MoreVertical,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  Users,
  UserX,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useI18n } from '@/app/providers/i18n-provider'
import { useAuth } from '@/app/providers/auth-provider'
import { officesOf, officeCountryOf } from '@/shared/auth/me'
import { useReferentials, codeLabel } from '@/shared/referentials'
import {
  usePartyAccount,
  usePatchPartyAccount,
  useDeletePartyAccount,
  usePartyAddressMutations,
  usePartyRoleMutations,
  usePartyFunctionMutations,
  useAnonymizePartyAccount,
  usePartyHistory,
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
import { Input } from '@/shared/ui/input'
import { PhoneDisplay } from '@/shared/ui/phone-display'
import { CountryDisplay } from '@/shared/ui/country-display'
import { PartyLogoEditor } from './party-logo-editor'
import { PartyCurrencySheet } from './party-currency-sheet'
import { PartyInterlocutorSheet } from './party-interlocutor-sheet'
import { PartyHistoryTab, KNOWN_SUBJECTS } from './party-history-tab'
import { PartyFinanceTab } from './party-finance-tab'
import { PartyDocumentsCard } from './party-documents-card'
import { SkeletonRow } from '@/shared/feedback'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
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

type FieldItem = { label: string; value: React.ReactNode }

/** Conserve les champs réellement renseignés (le vide n'est jamais affiché). */
function filled(items: FieldItem[]): FieldItem[] {
  return items.filter((i) => i.value != null && i.value !== '')
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-muted-foreground shrink-0 text-sm">{label}</span>
      <span className="text-foreground min-w-0 text-end text-sm break-words">
        {children}
      </span>
    </div>
  )
}

function FieldList({ items }: { items: FieldItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <Field key={item.label} label={item.label}>
          {item.value}
        </Field>
      ))}
    </div>
  )
}

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border-border border-b py-4 last:border-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="text-foreground text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
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
  const [railCollapsed, setRailCollapsed] = React.useState(false)
  const [showAllDetails, setShowAllDetails] = React.useState(false)
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
  const [anonymizeOpen, setAnonymizeOpen] = React.useState(false)
  const { remove: removeAddress } = usePartyAddressMutations(id)
  const roleMutations = usePartyRoleMutations(id)
  const functionMutations = usePartyFunctionMutations(id)
  const anonymize = useAnonymizePartyAccount(id)
  const intl = useIntl()
  const fmtDate = (iso: string | null): string | null =>
    iso
      ? intl.formatDate(iso, { day: 'numeric', month: 'long', year: 'numeric' })
      : null

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
  const functionLabel = React.useMemo(
    () => codeLabel(referentials?.functions),
    [referentials]
  )
  // accountId → nom de bureau ; `null` = « toutes les sociétés » (portée, jamais « manque »).
  const officeName = React.useCallback(
    (accountId: number | null): string => {
      if (accountId == null) return t('party.finance.allOffices')
      const found = (me ? officesOf(me) : []).find(
        (office) => office.accountId === accountId
      )
      return found ? found.displayName : `#${accountId}`
    },
    [me, t]
  )
  // UUID de société (valeur d'audit de l'historique) → nom lisible ; à défaut, l'UUID.
  const officeNameByPublicId = React.useCallback(
    (officePublicId: string): string => {
      const found = (me ? officesOf(me) : []).find(
        (office) => office.publicId === officePublicId
      )
      return found ? found.displayName : officePublicId
    },
    [me]
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
  // « TND — Tunisian Dinar » (code + libellé) : le code se comprend dans les 3 langues,
  // les libellés devise sont en anglais temporairement. `null` → pas de devise propre.
  const currencyText = React.useCallback(
    (code: string | null): string | null => {
      if (!code) return null
      const label = codeLabel(referentials?.currencies)(code)
      const upper = code.toUpperCase()
      return label === code ? upper : `${upper} — ${label}`
    },
    [referentials]
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
  const identityItems = filled([
    {
      label: t('party.column.nature'),
      value: t(`party.nature.${view.nature}`),
    },
    ...(view.nature === 'person'
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
          {
            label: t('party.detail.field.website'),
            value: organization?.website ? (
              <Ext href={organization.website}>
                {organization.website.replace(/^https?:\/\//, '')}
              </Ext>
            ) : null,
          },
        ]),
  ])

  const contactItems = filled([
    {
      label: t('party.detail.email'),
      // Badge vert/rouge (lecture seule, module Core) : la présence d'`emailVerifiedAt`
      // = vérifié. Pas de bouton — la vérification n'appartient pas à cette fiche.
      value: view.email ? (
        <span className="inline-flex flex-wrap items-center gap-2">
          <Ext href={`mailto:${view.email}`}>{view.email}</Ext>
          <Badge
            variant={view.emailVerifiedAt ? 'success' : 'destructive'}
            size="sm"
          >
            {view.emailVerifiedAt
              ? t('party.detail.emailVerified')
              : t('party.detail.emailNotVerified')}
          </Badge>
        </span>
      ) : null,
    },
    {
      label: t('party.column.phone'),
      value: view.phonePrimary ? (
        <PhoneDisplay value={view.phonePrimary} />
      ) : null,
    },
    {
      label: t('party.detail.field.phoneSecondary'),
      value: view.phoneSecondary ? (
        <PhoneDisplay value={view.phoneSecondary} />
      ) : null,
    },
    {
      label: t('party.column.country'),
      value: view.country ? <CountryDisplay code={view.country} /> : null,
    },
  ])

  // Devises toujours affichées : `null` n'est pas « vide » mais « suit le défaut du bureau ».
  const currencyDefault = (
    <span className="text-muted-foreground text-sm">
      {t('party.detail.currencyDefault')}
    </span>
  )
  const currencyItems = [
    {
      label: t('party.detail.currencyDisplay'),
      value: currencyText(view.displayCurrencyCode) ?? currencyDefault,
    },
    {
      label: t('party.detail.currencyBilling'),
      value: currencyText(view.billingCurrencyCode) ?? currencyDefault,
    },
  ]

  const parent = view.parentAccount

  const availableRoles = (referentials?.roles ?? []).filter(
    (r) => !view.roles.includes(r.code)
  )
  const roleErr = roleMutations.assign.error ?? roleMutations.revoke.error
  const roleError = roleErr instanceof ApiError ? roleErr.message : null

  const interlocutorErr = functionMutations.revoke.error
  const interlocutorError =
    interlocutorErr instanceof ApiError ? interlocutorErr.message : null

  // RGPD : tiers anonymisé → formulaire FERMÉ (aucune édition), bandeau, action retirée.
  const editable = view.anonymizedAt == null
  const officeCountry = me ? officeCountryOf(me) : null

  // Rôles — remontés au rail principal (visibles + colorés). Source unique : rendu
  // directement dans l'Identité, gestion add/remove conservée. Plus sous « Voir tous les détails ».
  const rolesSection = (
    <Section
      title={t('party.column.roles')}
      action={
        editable ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                mode="icon"
                variant="ghost"
                className="text-muted-foreground shrink-0"
                aria-label={t('party.detail.addRole')}
              >
                <Plus />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              {availableRoles.length > 0 ? (
                availableRoles.map((role) => (
                  <DropdownMenuItem
                    key={role.code}
                    onSelect={() => roleMutations.assign.mutate(role.code)}
                  >
                    {role.label}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  {t('party.detail.noMoreRoles')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-1.5 py-1.5">
        <div className="flex flex-wrap gap-1">
          {view.roles.length > 0 ? (
            view.roles.map((code) => (
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
            ))
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
        {roleError ? (
          <p className="text-destructive text-xs">{roleError}</p>
        ) : null}
      </div>
    </Section>
  )

  // « À traiter » (conformité + finance) — agrégé depuis les données DÉJÀ chargées,
  // aucune requête en plus. Portée restreinte (décision produit) ; panneau masqué si vide.
  const now = new Date()
  const daysUntil = (iso: string) =>
    Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000)
  const todoAlerts: {
    key: string
    Icon: LucideIcon
    iconClass: string
    text: React.ReactNode
  }[] = []
  if (view.email && !view.emailVerifiedAt) {
    todoAlerts.push({
      key: 'email',
      Icon: Mail,
      iconClass: 'text-blue-500',
      text: t('party.todo.emailUnverified'),
    })
  }
  const exoNoCert = view.taxExemptions.filter((e) => !e.hasCertificate).length
  if (exoNoCert > 0) {
    todoAlerts.push({
      key: 'exo',
      Icon: ShieldAlert,
      iconClass: 'text-amber-500',
      text: t('party.todo.exemptionNoCertificate', { count: exoNoCert }),
    })
  }
  view.approvalRules
    .filter((r) => !r.validatorStillQualified)
    .forEach((r) =>
      todoAlerts.push({
        key: `val-${r.publicId}`,
        Icon: ShieldAlert,
        iconClass: 'text-destructive',
        text: t('party.todo.validatorUnqualified', {
          name: r.validatorDisplayName,
        }),
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
        Icon: AlertTriangle,
        iconClass: d < 0 ? 'text-destructive' : 'text-amber-500',
        text: t(
          d < 0
            ? 'party.todo.extensionExpired'
            : 'party.todo.extensionExpiring',
          { date: fmtDate(c.validTo) ?? '' }
        ),
      })
    )

  // Activité récente — libellé du sujet réutilisé de l'onglet Historique (garde-fou
  // KNOWN_SUBJECTS : sujet inconnu → code brut). Verbe = participe (`op.*`).
  const recentEntries = recentHistory.data?.data ?? []
  const subjectLabel = (subject: string) =>
    KNOWN_SUBJECTS.has(subject) ? t(`party.history.subject.${subject}`) : subject
  const fmtActivity = (iso: string) =>
    intl.formatDate(iso, { day: 'numeric', month: 'short' })

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
    <div className="flex flex-col gap-6">
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

      {/* En-tête */}
      <div className="flex flex-col gap-4 px-4 lg:px-7.5">
        {backButton}
        <div className="flex flex-wrap items-center gap-4">
          <PartyLogoEditor
            publicId={id}
            logoUrl={view.logoUrl}
            nature={view.nature}
            readOnly={!editable}
            t={t}
          />
          <div className="min-w-0 grow">
            {editingName ? (
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
              <div className="flex items-center gap-2">
                <h1 className="text-foreground truncate text-xl font-medium">
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
              </div>
            )}
            {/* En-tête épuré : seule la pastille de statut reste ici. Nature + rôles
                sont désormais au rail (« Détails société »), plus rien en double. */}
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {stateBadges}
            </div>
          </div>
          <div className="ms-auto">
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
          </div>
        </div>
      </div>

      {/* Corps — tableau : bande « onglets | Détails société » avec UNE ligne
          horizontale pleine largeur dessous, puis contenu sur 2 colonnes séparées
          par un trait vertical continu. Pas de card : que des bordures de grille. */}
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_38%] lg:px-7.5"
      >
        {/* Haut-gauche : onglets. Ligne du bas + trait vertical portés par la cellule. */}
        <div className="border-border flex items-end border-b lg:border-e lg:pe-6">
          <TabsList variant="line" size="md" className="gap-5 border-b-0!">
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
            <TabsTrigger value="documents">
              <FileText />
              {t('party.detail.tab.documents')}
            </TabsTrigger>
            {/* Onglets futurs (Réservations/Paiements/Factures) retirés : ils débordaient
                sur le rail, et le « à venir » est déjà signalé dans la Vue d'ensemble.
                À rétablir quand les modules existent. */}
          </TabsList>
        </div>

        {/* Haut-droite : titre « Détails société » repliable, sur la même ligne. */}
        <div className="border-border flex items-center border-b lg:ps-6">
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
              {t(
                view.nature === 'person'
                  ? 'party.detail.section.personDetails'
                  : 'party.detail.section.companyDetails'
              )}
            </span>
          </button>
        </div>

        {/* Bas-gauche : contenu de l'onglet. Trait vertical porté par la cellule. */}
        <div className="border-border lg:border-e lg:pe-6">
          <TabsContent value="overview" className="flex flex-col gap-4 pt-4">
            {/* « À traiter » — alertes conformité + finance, masqué si rien à traiter.
                100 % données réelles ; l'agrégation vit dans le composant (pas de requête). */}
            {todoAlerts.length > 0 ? (
              <div className="border-border rounded-xl border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-foreground text-sm font-semibold">
                    {t('party.todo.title')}
                  </h3>
                  <Badge variant="warning" appearance="light" size="sm">
                    {todoAlerts.length}
                  </Badge>
                </div>
                <ul className="flex flex-col gap-2">
                  {todoAlerts.map((a) => (
                    <li
                      key={a.key}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <a.Icon
                        className={cn('mt-0.5 size-4 shrink-0', a.iconClass)}
                      />
                      <span className="text-foreground">{a.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Adresses */}
            <div className="border-border rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-foreground text-sm font-semibold">
                  {t('party.detail.addresses')}
                </h3>
                {editable ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingAddress(null)
                      setAddressSheetOpen(true)
                    }}
                  >
                    <Plus />
                    {t('party.detail.addAddress')}
                  </Button>
                ) : null}
              </div>
              {addressesLoading ? (
                <SkeletonRow columns={2} />
              ) : addresses.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {addresses.map((address) => (
                    <li
                      key={address.publicId}
                      className="border-border/60 flex items-start justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-sm font-medium">
                            {addressTypeLabel(address.addressType)}
                          </span>
                          {address.isPrimary ? (
                            <Badge variant="secondary" size="xs">
                              {t('party.address.primary')}
                            </Badge>
                          ) : null}
                        </div>
                        <span className="text-muted-foreground inline-flex flex-wrap items-center gap-x-1.5 text-sm">
                          <span>
                            {[
                              address.line1,
                              address.line2,
                              [address.postalCode, address.city]
                                .filter(Boolean)
                                .join(' '),
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                          {address.countryAlpha2 ? (
                            <CountryDisplay code={address.countryAlpha2} />
                          ) : null}
                        </span>
                      </div>
                      {editable ? (
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            size="sm"
                            mode="icon"
                            variant="ghost"
                            className="text-muted-foreground"
                            onClick={() => {
                              setEditingAddress(address)
                              setAddressSheetOpen(true)
                            }}
                            aria-label={t('party.detail.editAddress')}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="sm"
                            mode="icon"
                            variant="ghost"
                            className="text-muted-foreground"
                            onClick={() => setAddressToDelete(address)}
                            aria-label={t('party.detail.action.delete')}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t('party.detail.noAddresses')}
                </p>
              )}
            </div>

            {/* Activité récente — 5 dernières entrées d'historique (réel). « Voir tout »
                bascule vers l'onglet Historique. Les événements transactionnels
                (réservations/paiements) restent « à venir » (modules non construits). */}
            <div className="border-border rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-foreground text-sm font-semibold">
                  {t('party.detail.activity.title')}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary"
                  onClick={() => setTab('history')}
                >
                  {t('party.detail.activity.seeAll')}
                  <ChevronRight />
                </Button>
              </div>
              {recentHistory.isLoading ? (
                <SkeletonRow columns={1} />
              ) : recentEntries.length > 0 ? (
                <ul className="flex flex-col gap-2.5">
                  {recentEntries.map((entry, i) => (
                    <li
                      key={`${entry.at}-${i}`}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        <span className="text-foreground font-medium">
                          {entry.actor?.displayName ?? '—'}
                        </span>
                        <span className="text-muted-foreground">
                          {' · '}
                          {subjectLabel(entry.subject)}
                          {' · '}
                          {t(`party.history.op.${entry.operation}`)}
                        </span>
                      </span>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {fmtActivity(entry.at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t('party.detail.activity.empty')}
                </p>
              )}
              <p className="text-muted-foreground/70 border-border/60 mt-3 border-t pt-3 text-xs">
                {t('party.detail.soon.body')}
              </p>
            </div>

            {/* Interlocuteurs (organisations) — APERÇU cliquable ; « Voir tout » ouvre
                l'onglet Contacts & équipe (édition). Pas de tél/e-mail (donnée absente). */}
            {view.nature === 'organization' && view.contacts.length > 0 ? (
              <div className="border-border rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-foreground text-sm font-semibold">
                    {t('party.detail.section.contacts')}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary"
                    onClick={() => setTab('team')}
                  >
                    {t('party.detail.activity.seeAll')}
                    <ChevronRight />
                  </Button>
                </div>
                <ul className="flex flex-col gap-1">
                  {view.contacts.map((contact) => (
                    <li key={contact.publicId}>
                      <button
                        type="button"
                        onClick={() => navigate(`/parties/${contact.publicId}`)}
                        className="hover:bg-accent flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start"
                      >
                        <span className="text-foreground truncate text-sm">
                          {contact.displayName}
                        </span>
                        <Badge variant="secondary" appearance="light" size="sm">
                          {functionLabel(contact.functionCode)}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Chargés de compte (interne) — nom + type d'affectation + portée société. */}
            {view.managers.length > 0 ? (
              <div className="border-border rounded-xl border p-4">
                <h3 className="text-foreground mb-3 text-sm font-semibold">
                  {t('party.finance.managers')}
                </h3>
                <ul className="flex flex-col gap-2">
                  {view.managers.map((m) => (
                    <li
                      key={m.publicId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-foreground truncate">
                        {m.managerDisplayName}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {t(`party.finance.assignment.${m.assignmentType}`)}
                        </span>
                        <Badge variant="secondary" appearance="light" size="sm">
                          {officeName(m.officeAccountId)}
                        </Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
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

          <TabsContent value="team" className="flex flex-col gap-4 pt-4">
            {/* Interlocuteurs (organisations) — LEUR home : édition (ajout/retrait) + clic
                vers la fiche. Pas de tél/e-mail (donnée absente sur le lien contact). */}
            {view.nature === 'organization' ? (
              <div className="border-border rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-foreground text-sm font-semibold">
                    {t('party.detail.section.contacts')}
                  </h3>
                  {editable && view.accountId != null ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setInterlocutorOpen(true)}
                    >
                      <Plus />
                      {t('party.detail.addInterlocutor')}
                    </Button>
                  ) : null}
                </div>
                {view.contacts.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {view.contacts.map((contact) => (
                      <li
                        key={contact.publicId}
                        className="hover:bg-accent flex items-center gap-1 rounded-md px-2 py-1.5"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/parties/${contact.publicId}`)
                          }
                          className="flex min-w-0 flex-1 items-center justify-between gap-2 text-start"
                        >
                          <span className="text-foreground truncate text-sm">
                            {contact.displayName}
                          </span>
                          <Badge
                            variant="secondary"
                            appearance="light"
                            size="sm"
                          >
                            {functionLabel(contact.functionCode)}
                          </Badge>
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
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {t('party.detail.noInterlocutor')}
                  </p>
                )}
                {interlocutorError ? (
                  <p className="text-destructive mt-1 text-xs">
                    {interlocutorError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* Chargés de compte (interne) — liste ; ils se gèrent dans l'onglet Finance. */}
            <div className="border-border rounded-xl border p-4">
              <h3 className="text-foreground mb-3 text-sm font-semibold">
                {t('party.finance.managers')}
              </h3>
              {view.managers.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {view.managers.map((m) => (
                    <li
                      key={m.publicId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-foreground truncate">
                        {m.managerDisplayName}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {t(`party.finance.assignment.${m.assignmentType}`)}
                        </span>
                        <Badge variant="secondary" appearance="light" size="sm">
                          {officeName(m.officeAccountId)}
                        </Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t('party.finance.managers.empty')}
                </p>
              )}
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
        </div>

        {/* Bas-droite : champs « Détails société » — pas de card. Le titre est déjà
            sur la bande du haut ; le trait vertical de la grille sépare du contenu.
            Rôles/État restent dans l'en-tête → « Voir tous les détails » ne perd rien. */}
        <aside className="pt-4 lg:ps-6">
          <div className="lg:sticky lg:top-6">
            {!railCollapsed ? (
              <>
                <Section
                  title={t('party.detail.section.identity')}
                  action={
                    editable ? (
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
                    ) : undefined
                  }
                >
                  {identityItems.length > 0 ? (
                    <FieldList items={identityItems} />
                  ) : (
                    <p className="text-muted-foreground py-1.5 text-sm">
                      {t('party.detail.identityPending')}
                    </p>
                  )}
                </Section>

                {rolesSection}

                <Section
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
                >
                  {contactItems.length > 0 ? (
                    <FieldList items={contactItems} />
                  ) : (
                    <p className="text-muted-foreground py-1.5 text-sm">—</p>
                  )}
                </Section>

                <Section
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
                >
                  <FieldList items={currencyItems} />
                </Section>

                <button
                  type="button"
                  onClick={() => setShowAllDetails((v) => !v)}
                  className="text-primary flex items-center gap-1 py-3 text-sm font-medium"
                >
                  {showAllDetails
                    ? t('party.detail.showLess')
                    : t('party.detail.showAllDetails')}
                  <ChevronRight
                    className={cn(
                      'size-4 transition-transform',
                      showAllDetails && 'rotate-90'
                    )}
                  />
                </button>

                {showAllDetails ? (
                  <>
                    {/* Bureaux (rattachements MULTIPLES) — avec leur TITRE (client/fournisseur).
                Un même bureau peut apparaître 2× (client ET fournisseur). Lecture seule
                pour l'instant (gestion rattacher/détacher dans un second temps). */}
                    {view.offices.length > 0 ? (
                      <Section title={t('party.column.offices')}>
                        <div className="flex flex-col gap-1.5 py-1.5">
                          {view.offices.map((office) => (
                            <div
                              key={`${office.publicId}-${office.relationType}`}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="text-foreground text-sm">
                                {office.displayName}
                              </span>
                              <Badge variant="secondary" size="sm">
                                {roleLabel(office.relationType)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Section>
                    ) : view.officeScope === 'all_offices' ? (
                      <Section title={t('party.column.offices')}>
                        <div className="text-muted-foreground py-1.5 text-sm">
                          {t('party.offices.all')}
                        </div>
                      </Section>
                    ) : null}

                    {/* Interlocuteurs : déplacés dans l'onglet « Contacts & équipe »
                        (édition) + aperçu sur la Vue d'ensemble. Plus dans le rail. */}

                    {/* Agence mère (UNIQUE) — organisations seulement, éditable. */}
                    {view.nature === 'organization' ? (
                      <Section
                        title={t('party.detail.editParent')}
                        action={
                          editable ? (
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
                          ) : undefined
                        }
                      >
                        {parent ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/parties/${parent.publicId}`)
                            }
                            className="text-primary py-1.5 text-sm hover:underline"
                          >
                            {parent.displayName}
                          </button>
                        ) : (
                          <p className="text-muted-foreground py-1.5 text-sm">
                            —
                          </p>
                        )}
                      </Section>
                    ) : null}

                    {/* Sous-agences (enfants) — lecture seule, cliquable. RLS : une fille hors
                périmètre n'apparaît pas → on masque la section quand la liste est vide
                (pas de « aucune sous-agence » trompeur). Le lien se pose sur l'ENFANT. */}
                    {view.nature === 'organization' &&
                    view.children.length > 0 ? (
                      <Section title={t('party.detail.section.children')}>
                        <div className="flex flex-col gap-0.5 py-1.5">
                          {view.children.map((child) => (
                            <button
                              key={child.publicId}
                              type="button"
                              onClick={() =>
                                navigate(`/parties/${child.publicId}`)
                              }
                              className="text-primary py-1 text-start text-sm hover:underline"
                            >
                              {child.displayName}
                            </button>
                          ))}
                        </div>
                      </Section>
                    ) : null}

                    {view.groups.length > 0 ? (
                      <Section title={t('party.detail.section.groups')}>
                        <div className="flex flex-wrap gap-1 py-1.5">
                          {view.groups.map((group) => (
                            <Badge
                              key={group.publicId}
                              variant="secondary"
                              size="sm"
                            >
                              {group.name}
                            </Badge>
                          ))}
                        </div>
                      </Section>
                    ) : null}

                    <Section title={t('party.column.state')}>
                      <div className="flex flex-wrap gap-1 py-1.5">
                        {stateBadges}
                      </div>
                    </Section>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </aside>
      </Tabs>

      {view.createdAt || view.updatedAt ? (
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
      ) : null}

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
    </div>
  )
}
