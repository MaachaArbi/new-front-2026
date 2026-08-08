import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  DollarSign,
  FileText,
  Globe,
  Handshake,
  History,
  LayoutGrid,
  ListChecks,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  StickyNote,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import './dev-ref.css'

/**
 * PAGE JETABLE (`/_ref`) — copie statique **fidèle** de la maquette CRM de référence
 * (TBG Corporation), posée dans NOTRE coquille (sidebar/menu/barre) pour comparer.
 * Aucune donnée du back, aucun composant métier : tout est en dur. À SUPPRIMER
 * (ce fichier + la route `_ref`) une fois la comparaison faite.
 */

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${color}`}
    >
      {initials}
    </span>
  )
}

/**
 * Référentiel des couleurs de rôles — **côté front**, pas en base (choix d'Arbi).
 * Palette douce ; on retombe sur le gris si un code n'est pas mappé.
 */
const ROLE_STYLE: Record<string, string> = {
  Client: 'bg-blue-50 text-blue-700',
  Fournisseur: 'bg-amber-50 text-amber-700',
}

/** Onglets gauche (cliquables). Activity → Finance. */
const LEFT_TABS: {
  id: string
  label: string
  Icon: LucideIcon
  badge?: string
}[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutGrid },
  { id: 'finance', label: 'Finance', Icon: Wallet },
  { id: 'historique', label: 'Historique', Icon: History },
  { id: 'team', label: 'Contacts & équipe', Icon: Users },
  { id: 'notes', label: 'Notes', Icon: StickyNote },
  { id: 'tasks', label: 'Tâches', Icon: ListChecks, badge: '3' },
  { id: 'files', label: 'Documents', Icon: FileText },
]

/** Interrupteur visuel (non fonctionnel) — pour la V2 « Politique commerciale ». */
function SwitchPill({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 ${on ? 'bg-emerald-500' : 'bg-gray-300'}`}
    >
      <span
        className={`size-4 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : ''}`}
      />
    </span>
  )
}

/** En-tête de section finance V2 : titre + sous-titre + action à droite. */
function FinanceHead({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action: string
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle ? <p className="text-xs text-gray-400">{subtitle}</p> : null}
      </div>
      <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium">
        <Plus className="size-4" /> {action}
      </button>
    </div>
  )
}

/**
 * Proposition V2 de la rubrique Finance — orientée « trouver l'info vite » (outil 8 h/jour) :
 * la réponse d'abord (plafond EFFECTIF), le détail ensuite, l'historique caché ; couleur
 * retenue (rouge = vrai problème seulement) ; réglages en interrupteurs ; états actionnables.
 */
function FinanceV2() {
  return (
    <div>
      {/* 1) PLAFONDS — plafond effectif par bureau·produit, détail dessous, historique replié */}
      <section className="mb-9">
        <FinanceHead
          title="Plafonds de crédit"
          subtitle="Plafond effectif = socle + rallonges actives, par bureau et produit."
          action="Ajouter un plafond"
        />
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              scope: 'myGO Tunis-Arbi · Hébergement',
              total: '550 000',
              lines: [
                {
                  k: 'Socle',
                  c: 'bg-blue-500',
                  v: '500 000 · permanent',
                  vc: 'text-gray-500',
                },
                {
                  k: 'Rallonge',
                  c: 'bg-amber-500',
                  v: '+50 000 · exp. 31/12/25',
                  vc: 'text-emerald-600',
                },
              ],
            },
            {
              scope: 'myGO Tunis-Arbi · Vols',
              total: '200 000',
              lines: [
                {
                  k: 'Socle',
                  c: 'bg-blue-500',
                  v: '200 000 · permanent',
                  vc: 'text-gray-500',
                },
              ],
            },
          ].map((g) => (
            <div
              key={g.scope}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500">{g.scope}</div>
                  <div className="mt-0.5 text-2xl font-semibold text-gray-900">
                    {g.total}{' '}
                    <span className="text-base font-normal text-gray-400">
                      TND
                    </span>
                  </div>
                </div>
                <MoreHorizontal className="size-4 text-gray-400" />
              </div>
              <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 text-sm">
                {g.lines.map((l) => (
                  <div key={l.k} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-gray-700">
                      <span className={`size-2 rounded-full ${l.c}`} /> {l.k}
                    </span>
                    <span className={l.vc}>{l.v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <details className="mt-3 rounded-xl border border-gray-200 px-4 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 py-3 font-medium text-gray-500">
            <ChevronRight className="size-4" /> Historique (2)
          </summary>
          <div className="flex flex-col gap-1.5 pb-3 text-gray-400">
            <div className="flex items-center justify-between">
              <span>Rallonge · Hébergement · +30 000</span>
              <span>expirée le 30/06/25</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Socle · myGO Alger · 300 000</span>
              <span>remplacé le 31/07/25</span>
            </div>
          </div>
        </details>
      </section>

      {/* 2) EXONÉRATIONS — le manque de justificatif = alerte actionnable (ambre), pas un tag rouge mort */}
      <section className="mb-9">
        <FinanceHead
          title="Exonérations de TVA"
          action="Ajouter une exonération"
        />
        <div className="rounded-xl border border-gray-200">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0">
            <span className="flex min-w-0 items-center gap-3">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                TVA
              </span>
              <span className="font-medium">myGO Tunis-Arbi</span>
              <span className="text-sm text-gray-400">
                valide depuis le 07/08/26
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                <AlertTriangle className="size-3.5" /> Justificatif manquant
              </span>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm font-medium">
                <FileText className="size-4" /> Ajouter
              </button>
            </span>
          </div>
        </div>
      </section>

      {/* 3) POLITIQUE COMMERCIALE — des réglages = des interrupteurs, pas des tags */}
      <section className="mb-9">
        <FinanceHead
          title="Politique commerciale"
          subtitle="La règle la plus précise l'emporte (par société)."
          action="Définir une politique"
        />
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="mb-3 text-xs font-medium text-gray-500">
            Société : myGO Tunis-Arbi
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            {[
              {
                label: 'Forcer le plafond sur demande',
                sub: 'Un agent peut forcer malgré le plafond.',
                on: true,
              },
              {
                label: 'Bloquer si solde insuffisant',
                sub: 'Refuse l’opération sous le seuil.',
                on: true,
              },
              {
                label: 'Autoriser le dépassement du plafond',
                sub: 'Tolère un dépassement contrôlé.',
                on: false,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800">
                    {s.label}
                  </div>
                  <div className="text-xs text-gray-400">{s.sub}</div>
                </div>
                <SwitchPill on={s.on} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4) APPROBATIONS — modèle réel : PAS de seuil de montant. Un pool de
          validateurs (chacun avec sa fonction) ; l'accord d'un seul suffit ; alerte
          si un validateur n'est plus habilité (validatorStillQualified = false). */}
      <section>
        <FinanceHead
          title="Approbations"
          subtitle="Plusieurs validateurs possibles ; l'accord d'un seul suffit."
          action="Ajouter un validateur"
        />
        <div className="rounded-xl border border-gray-200">
          {[
            {
              i: 'AH',
              c: 'bg-teal-500',
              n: 'Ahmed Khelifi',
              f: 'Gérant',
              ok: true,
            },
            {
              i: 'FT',
              c: 'bg-violet-500',
              n: 'Fatma Zouari',
              f: 'Comptable',
              ok: false,
            },
          ].map((v) => (
            <div
              key={v.n}
              className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Avatar initials={v.i} color={v.c} />
                <span className="font-medium">{v.n}</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  {v.f}
                </span>
                {!v.ok ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    <AlertTriangle className="size-3.5" /> N'est plus habilité
                  </span>
                ) : null}
              </span>
              <Pencil className="size-4 shrink-0 text-gray-400" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/**
 * Onglet « Contacts & équipe » — répertoire COMPLET : interlocuteurs (externes) +
 * chargés de compte (internes), avec gestion par ligne (éditer / retirer). Overview
 * n'en montre que le résumé (top 3).
 */
function ContactsEquipe() {
  const interlocuteurs = [
    {
      a: 'YG',
      c: 'bg-violet-500',
      n: 'Yasmine Gharbi',
      f: 'Gérant',
      tel: '+216 22 111 222',
      mail: 'y.gharbi@sahara.tn',
    },
    {
      a: 'KB',
      c: 'bg-sky-500',
      n: 'Karim Belhadj',
      f: 'Comptable',
      tel: '+216 55 333 444',
      mail: 'k.belhadj@sahara.tn',
    },
    {
      a: 'SB',
      c: 'bg-rose-400',
      n: 'Sarah Ben Salah',
      f: 'Agent',
      tel: '+216 98 555 666',
      mail: 's.bensalah@sahara.tn',
    },
    {
      a: 'MT',
      c: 'bg-teal-500',
      n: 'Mohamed Trabelsi',
      f: 'Responsable achats',
      tel: '+216 71 222 333',
      mail: 'm.trabelsi@sahara.tn',
    },
    {
      a: 'LC',
      c: 'bg-amber-500',
      n: 'Leïla Cherif',
      f: 'Assistante',
      tel: '+216 29 444 555',
      mail: 'l.cherif@sahara.tn',
    },
  ]
  const charges = [
    {
      a: 'NH',
      c: 'bg-emerald-500',
      n: 'Nizar Hamdi',
      f: 'Commercial',
      office: 'myGO Tunis-Arbi',
    },
    {
      a: 'FZ',
      c: 'bg-amber-500',
      n: 'Fatma Zouari',
      f: 'Recouvrement',
      office: 'myGO Sfax',
    },
    {
      a: 'AB',
      c: 'bg-blue-500',
      n: 'Ahmed Bouazizi',
      f: 'Commercial',
      office: 'myGO Alger',
    },
  ]
  return (
    <div>
      {/* INTERLOCUTEURS (externes) — répertoire complet + gestion par ligne. */}
      <section className="mb-9">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Users className="size-4 text-gray-500" /> Interlocuteurs
            <span className="text-xs font-normal text-gray-400">
              · contacts chez le client · {interlocuteurs.length}
            </span>
          </div>
          <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium">
            <Plus className="size-4" /> Ajouter un interlocuteur
          </button>
        </div>
        <div className="rounded-xl border border-gray-200">
          {interlocuteurs.map((r) => (
            <div
              key={r.n}
              className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Avatar initials={r.a} color={r.c} />
                <span className="w-40 shrink-0 font-medium">{r.n}</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  {r.f}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 text-gray-500">
                  <Phone className="size-3.5 text-gray-400" /> {r.tel}
                </span>
                <a className="inline-flex items-center gap-1.5 text-blue-600">
                  <Mail className="size-3.5" /> {r.mail}
                </a>
                <span className="ms-2 flex items-center gap-2 text-gray-400">
                  <Pencil className="size-4 hover:text-gray-700" />
                  <X className="size-4 hover:text-gray-700" />
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CHARGÉS DE COMPTE (internes) — votre équipe sur ce compte. */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Briefcase className="size-4 text-gray-500" /> Chargés de compte
            <span className="text-xs font-normal text-gray-400">
              · votre équipe · {charges.length}
            </span>
          </div>
          <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium">
            <Plus className="size-4" /> Ajouter un chargé
          </button>
        </div>
        <div className="rounded-xl border border-gray-200">
          {charges.map((r) => (
            <div
              key={r.n}
              className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Avatar initials={r.a} color={r.c} />
                <span className="w-40 shrink-0 font-medium">{r.n}</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  {r.f}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-4 text-sm">
                <span className="text-gray-500">{r.office}</span>
                <span className="ms-2 flex items-center gap-2 text-gray-400">
                  <Pencil className="size-4 hover:text-gray-700" />
                  <X className="size-4 hover:text-gray-700" />
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/** Onglet « Documents » (ex-Files) — RÉEL (`PartyDocument`). Type + n° + dates +
 *  statut d'expiration ; et l'état du scan (`hasFile=false` → « Sans scan », à montrer
 *  sinon personne ne relance). */
function DocumentsTab() {
  const docs = [
    {
      type: 'CIN',
      num: '12 345 678',
      flag: '🇹🇳',
      dates: 'Expire 12/2030',
      status: { l: 'Valide', c: 'bg-emerald-50 text-emerald-700' },
      file: true,
    },
    {
      type: 'Passeport',
      num: 'A1234567',
      flag: '🇹🇳',
      dates: 'Expire 03/2026',
      status: { l: 'Expire bientôt', c: 'bg-amber-50 text-amber-700' },
      file: true,
    },
    {
      type: 'Contrat commercial 2025',
      num: null,
      flag: '',
      dates: 'Signé le 15/01/2025',
      status: null,
      file: false,
    },
    {
      type: 'Registre de commerce',
      num: 'RC 123456',
      flag: '🇹🇳',
      dates: 'Expiré le 30/06/2025',
      status: { l: 'Expiré', c: 'bg-rose-50 text-rose-700' },
      file: false,
    },
  ]
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <FileText className="size-4 text-gray-500" /> Documents
          <span className="text-xs font-normal text-gray-400">
            · {docs.length}
          </span>
        </div>
        <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium">
          <Plus className="size-4" /> Ajouter un document
        </button>
      </div>
      <div className="rounded-xl border border-gray-200">
        {docs.map((d) => (
          <div
            key={d.type}
            className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
          >
            <span className="flex min-w-0 items-center gap-3">
              <FileText className="size-4 shrink-0 text-gray-400" />
              <span className="font-medium">{d.type}</span>
              {d.num ? (
                <span className="text-sm text-gray-400">· n° {d.num}</span>
              ) : null}
              {d.flag ? <span>{d.flag}</span> : null}
            </span>
            <span className="flex shrink-0 items-center gap-3 text-sm">
              <span className="text-gray-500">{d.dates}</span>
              {d.status ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${d.status.c}`}
                >
                  {d.status.l}
                </span>
              ) : null}
              {d.file ? (
                <a className="font-medium text-blue-600">Voir</a>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    Sans scan
                  </span>
                  <a className="font-medium text-blue-600">Ajouter</a>
                </span>
              )}
              <Pencil className="size-4 text-gray-400" />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Onglet « Notes » — PLACEHOLDER (pas de notes côté back). Annotations internes
 *  sur le client (auteur · date · texte). */
function NotesTab() {
  const notes = [
    {
      a: 'NH',
      c: 'bg-emerald-500',
      who: 'Nizar Hamdi',
      when: 'il y a 2 j',
      txt: 'Client fidèle. Négociation en cours pour le contrat 2026 ; préfère être contacté par e-mail.',
    },
    {
      a: 'FZ',
      c: 'bg-amber-500',
      who: 'Fatma Zouari',
      when: 'il y a 1 sem.',
      txt: 'Relancé pour la facture #1287 ; promet un règlement fin du mois.',
    },
    {
      a: 'YG',
      c: 'bg-violet-500',
      who: 'Yasmine Gharbi',
      when: 'il y a 3 sem.',
      txt: 'A demandé un devis groupe pour un séjour à Djerba (12 pax).',
    },
  ]
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <StickyNote className="size-4 text-gray-500" /> Notes
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-gray-400 uppercase">
            à venir
          </span>
        </div>
        <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium">
          <Plus className="size-4" /> Ajouter une note
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {notes.map((n) => (
          <div key={n.txt} className="rounded-xl border border-gray-200 p-4">
            <div className="mb-1.5 flex items-center gap-2 text-sm">
              <Avatar initials={n.a} color={n.c} />
              <span className="font-medium">{n.who}</span>
              <span className="text-gray-400">· {n.when}</span>
            </div>
            <p className="text-sm text-gray-600">{n.txt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Onglet « Tâches » — PLACEHOLDER (pas de tâches côté back). Rappels/todos du client
 *  (titre · échéance · assigné · statut). Distinct des alertes système d'Overview. */
function TasksTab() {
  const tasks = [
    {
      t: 'Envoyer le devis Hébergement',
      due: 'Échéance 12/08',
      a: 'NH',
      c: 'bg-emerald-500',
      done: false,
      late: false,
    },
    {
      t: 'Relancer le paiement de la facture #1287',
      due: 'En retard · 15/08',
      a: 'FZ',
      c: 'bg-amber-500',
      done: false,
      late: true,
    },
    {
      t: 'Vérifier le justificatif d’exonération',
      due: 'Fait le 07/08',
      a: 'YG',
      c: 'bg-violet-500',
      done: true,
      late: false,
    },
  ]
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ListChecks className="size-4 text-gray-500" /> Tâches
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-gray-400 uppercase">
            à venir
          </span>
        </div>
        <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium">
          <Plus className="size-4" /> Ajouter une tâche
        </button>
      </div>
      <div className="rounded-xl border border-gray-200">
        {tasks.map((t) => (
          <div
            key={t.t}
            className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span
                className={`inline-flex size-4 shrink-0 items-center justify-center rounded border ${t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300'}`}
              >
                {t.done ? <Check className="size-3" /> : null}
              </span>
              <span
                className={`truncate ${t.done ? 'text-gray-400 line-through' : 'font-medium'}`}
              >
                {t.t}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3 text-sm">
              <span className={t.late ? 'text-rose-600' : 'text-gray-500'}>
                {t.due}
              </span>
              <Avatar initials={t.a} color={t.c} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Onglet « Historique » — journal d'audit POUR AGENT (pas un dump technique) :
 * base timeline Metronic (groupée par jour, une ligne = qui·quoi·quand) + NOS filtres
 * (nature/action/auteur/période/recherche) + détail HUMANISÉ dépliable (avant→après,
 * validateur = nom pas UUID, dates formatées). Lignes simples, pas de cartes riches.
 */
function HistoriqueTab() {
  const groups: {
    day: string
    events: {
      author: string
      ai: string
      ac: string
      verb: string
      vc: string
      Icon: LucideIcon
      entity: string
      summary: string
      when: string
      open?: boolean
      detail: [string, string][]
    }[]
  }[] = [
    {
      day: "Aujourd'hui · 8 août 2026",
      events: [
        {
          author: 'Salma Ben Amor',
          ai: 'SB',
          ac: 'bg-rose-400',
          verb: 'a ajouté',
          vc: 'text-emerald-600',
          Icon: ShieldCheck,
          entity: 'une règle d’approbation',
          summary: 'Validateur : Nabil Ayari · myGO Tunis-Arbi',
          when: '01 h 36',
          detail: [
            ['Fonction', 'Manager'],
            ['Validateur', 'Nabil Ayari'],
            ['Société', 'myGO Tunis-Arbi'],
            ['Valide du', '8 août 2026'],
          ],
        },
        {
          author: 'Mehdi Trabelsi',
          ai: 'MT',
          ac: 'bg-blue-500',
          verb: 'a ajouté',
          vc: 'text-emerald-600',
          Icon: DollarSign,
          entity: 'un plafond de crédit',
          summary: '5 000 EUR · Hébergement · myGO Tunis-Arbi',
          when: '00 h 43',
          open: true,
          detail: [
            ['Devise', 'EUR'],
            ['Type de service', 'Hébergement'],
            ['Montant', '5 000,00 EUR'],
            ['Société', 'myGO Tunis-Arbi'],
            ['Valide du', '1 janvier 2026'],
            ['Valide au', '1 janvier 2027'],
          ],
        },
      ],
    },
    {
      day: 'Hier · 7 août 2026',
      events: [
        {
          author: 'Mehdi Trabelsi',
          ai: 'MT',
          ac: 'bg-blue-500',
          verb: 'a ajouté',
          vc: 'text-emerald-600',
          Icon: MapPin,
          entity: 'une adresse',
          summary: 'Domiciliation · 18 Rue Ibn El Aghlab, Manouba',
          when: '22 h 44',
          detail: [
            ['Type d’adresse', 'Domiciliation'],
            ['Ligne 1', '18 Rue Ibn El Aghlab'],
            ['Ville', 'Manouba'],
            ['Code postal', '2010'],
            ['Pays', 'Tunisie'],
            ['Adresse principale', 'Non'],
          ],
        },
        {
          author: 'Mehdi Trabelsi',
          ai: 'MT',
          ac: 'bg-blue-500',
          verb: 'a ajouté',
          vc: 'text-emerald-600',
          Icon: MapPin,
          entity: 'une adresse',
          summary: 'Légale · 12 Rue Foulen ben Foulen, Manouba',
          when: '22 h 44',
          detail: [
            ['Type d’adresse', 'Légale'],
            ['Ligne 1', '12 Rue Foulen ben Foulen'],
            ['Ville', 'Manouba'],
            ['Code postal', '2010'],
            ['Pays', 'Tunisie'],
            ['Adresse principale', 'Non'],
          ],
        },
      ],
    },
    {
      day: '6 août 2026',
      events: [
        {
          author: 'Mehdi Trabelsi',
          ai: 'MT',
          ac: 'bg-blue-500',
          verb: 'a modifié',
          vc: 'text-blue-600',
          Icon: DollarSign,
          entity: 'un plafond de crédit',
          summary: 'Montant : 5 000 → 8 000 EUR',
          when: '14 h 20',
          detail: [['Montant', '5 000,00 → 8 000,00 EUR']],
        },
        {
          author: 'Salma Ben Amor',
          ai: 'SB',
          ac: 'bg-rose-400',
          verb: 'a retiré',
          vc: 'text-rose-600',
          Icon: Handshake,
          entity: 'un rôle',
          summary: 'Rôle « Prospect »',
          when: '09 h 10',
          detail: [['Rôle', 'Prospect']],
        },
      ],
    },
  ]
  return (
    <div>
      {/* Barre de filtres — le cœur de la demande (le design Metronic n'en a pas). */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Rechercher dans l'historique…"
            className="w-full rounded-lg border border-gray-200 py-2 ps-9 pe-3 text-sm"
          />
        </div>
        {['Nature', 'Action', 'Auteur', 'Période'].map((f) => (
          <button
            key={f}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600"
          >
            {f} <ChevronDown className="size-4 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Timeline groupée par jour. */}
      {groups.map((g) => (
        <div key={g.day}>
          <div className="mt-4 mb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            {g.day}
          </div>
          {/* Timeline SANS cards ni bordures (design Metronic) : un trait vertical,
              les avatars = nœuds ; condensé pour gagner de l'espace. */}
          <div className="relative">
            <span
              aria-hidden
              className="absolute start-3 top-3 bottom-3 w-px bg-gray-200"
            />
            {g.events.map((e, i) => (
              <details key={`${e.entity}-${i}`} open={e.open} className="group">
                <summary className="flex list-none cursor-pointer items-start justify-between gap-3 py-2.5 [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 items-start gap-3">
                    <span className="relative z-10 inline-flex rounded-full ring-4 ring-white">
                      <Avatar initials={e.ai} color={e.ac} />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="text-sm">
                        <span className="font-medium">{e.author}</span>{' '}
                        <span className={e.vc}>{e.verb}</span>{' '}
                        <span className="inline-flex items-center gap-1">
                          <e.Icon className="size-3.5 text-gray-400" />
                          <span className="font-medium">{e.entity}</span>
                        </span>
                      </span>
                      <div className="text-xs text-gray-400">{e.summary}</div>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 pt-0.5 text-xs text-gray-400">
                    {e.when}
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <div className="ms-9 grid grid-cols-[168px_1fr] gap-x-3 gap-y-1.5 pb-3 text-sm">
                  {e.detail.map(([k, v]) => (
                    <React.Fragment key={k}>
                      <span className="text-gray-500">{k}</span>
                      <span className="text-gray-800">{v}</span>
                    </React.Fragment>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function DevRefPage() {
  const [tab, setTab] = React.useState<string>('overview')
  const [railOpen, setRailOpen] = React.useState(true)
  return (
    <div
      className="text-[15px] text-gray-900 lg:-mt-4 lg:flex lg:h-[calc(100dvh-128px)] lg:flex-col lg:overflow-hidden"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Inter, comme la référence (dev only ; retombe sur la police système hors ligne). */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />

      {/* Bandeau NOM — porte désormais le STATUT (chip État) et les ACTIONS
          principales (le mètre carré le plus regardé travaille). Retour = petit
          lien en haut à gauche (les actions occupent la droite). */}
      <div className="border-b border-gray-200 px-4 pb-4 lg:px-6">
        <button className="-ms-0.5 mb-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
          <ArrowLeft className="size-3.5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
            <Building2 className="size-6" />
          </span>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">
              Groupe Sahara Voyages
            </h1>
            <Pencil className="size-4 text-gray-400" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Actif
            </span>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
              <Plus className="size-4" /> Nouvelle réservation
            </button>
            <button className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:min-h-0 lg:grow lg:grid-cols-[minmax(0,1fr)_38%] lg:grid-rows-[auto_minmax(0,1fr)]">
        {/* ───────── Bande onglets : gauche (Overview…) ───────── */}
        <div className="border-b border-gray-200 ps-4 lg:border-e lg:ps-6 lg:pe-6">
          <nav className="flex items-center gap-6 text-sm font-medium">
            {LEFT_TABS.map((t) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`-mb-px flex items-center gap-2 border-b-2 py-3 ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                  <t.Icon className="size-4" /> {t.label}
                  {t.badge ? (
                    <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                      {t.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </nav>
        </div>

        {/* ───────── Bande droite : « Détails société » sur la ligne des onglets
            (fini « Details / Comments » du template ; pas de commentaires chez nous). ───────── */}
        <div className="flex items-center border-b border-gray-200 pe-4 lg:ps-6 lg:pe-6">
          <button
            type="button"
            onClick={() => setRailOpen((v) => !v)}
            className="flex items-center gap-2 py-3 text-sm font-semibold text-gray-900"
          >
            <ChevronDown
              className={`size-4 text-gray-500 transition-transform ${railOpen ? '' : '-rotate-90'}`}
            />
            Détails société
          </button>
        </div>

        {/* ───────── Contenu gauche (SEULE zone qui défile) — scrollbar fine ───────── */}
        <div className="ref-scroll ps-4 pt-5 lg:min-h-0 lg:overflow-y-auto lg:border-e lg:border-gray-200 lg:ps-6 lg:pe-6">
          {tab === 'finance' ? (
            <FinanceV2 />
          ) : tab === 'historique' ? (
            <HistoriqueTab />
          ) : tab === 'team' ? (
            <ContactsEquipe />
          ) : tab === 'files' ? (
            <DocumentsTab />
          ) : tab === 'notes' ? (
            <NotesTab />
          ) : tab === 'tasks' ? (
            <TasksTab />
          ) : (
            <>
              {/* À TRAITER — alertes agrégées (données réelles) : la page
                  d'atterrissage montre d'abord ce qui demande une action. */}
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <AlertTriangle className="size-4 text-amber-500" /> À traiter
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  4
                </span>
              </div>
              <div className="mb-8 rounded-xl border border-gray-200">
                {[
                  { sev: 'rose', txt: 'E-mail non vérifié', act: 'Vérifier' },
                  {
                    sev: 'rose',
                    txt: 'Exonération TVA sans justificatif',
                    act: 'Ajouter le justificatif',
                  },
                  {
                    sev: 'rose',
                    txt: 'Validateur « Fatma Zouari » n’est plus habilité',
                    act: 'Remplacer',
                  },
                  {
                    sev: 'amber',
                    txt: 'Rallonge Hébergement expire le 31/12/25',
                    act: 'Voir',
                  },
                ].map((a) => (
                  <div
                    key={a.txt}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`size-2 shrink-0 rounded-full ${a.sev === 'rose' ? 'bg-rose-500' : 'bg-amber-500'}`}
                      />
                      <span className="truncate">{a.txt}</span>
                    </span>
                    <a className="shrink-0 text-sm font-medium text-blue-600">
                      {a.act}
                    </a>
                  </div>
                ))}
              </div>

              {/* APERÇU — ex-« Highlights » (le nom promettait des signaux, pas de
                  l'identité figée). */}
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <LayoutGrid className="size-4 text-gray-500" /> Aperçu
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Identité (1re card) — MF, RC, Forme juridique (nos données). */}
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Identité
                    </span>
                    <MoreHorizontal className="size-4 text-gray-400" />
                  </div>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-500">Matricule fiscal</span>
                      <span className="font-medium">MF : 123456</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-500">
                        Registre de commerce
                      </span>
                      <span className="font-medium">RC : 123456</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-500">Forme juridique</span>
                      <span className="font-medium">SARL</span>
                    </div>
                  </div>
                </div>
                {/* Rattachements (2e card) — englobe les liaisons de l'agence :
                bureau(x), agence mère, agences filles. */}
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Rattachements
                    </span>
                    <MoreHorizontal className="size-4 text-gray-400" />
                  </div>
                  <div className="flex flex-col gap-3 text-sm">
                    {/* Bureau — même ligne ; C = Client (rond + tooltip, comme le « T »). */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-500">Bureau</span>
                      <span className="inline-flex items-center gap-2 font-medium">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              aria-label="Client"
                              className="inline-flex size-5 cursor-default items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-700"
                            >
                              C
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Client</TooltipContent>
                        </Tooltip>
                        myGO Tunis-Arbi
                      </span>
                    </div>
                    {/* Agence mère — même ligne. */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-500">Agence mère</span>
                      <a className="font-medium text-blue-600 hover:underline">
                        Sahara Voyages Tunis
                      </a>
                    </div>
                    {/* Agences filles — compteur ; survol = liste avec initiales. */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-500">Agences filles</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            aria-label="Agences filles"
                            className="inline-flex cursor-default items-center gap-1.5 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                          >
                            <Users className="size-3.5" /> 2 filles
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5">
                              <Avatar initials="D" color="bg-sky-500" />
                              Sahara Voyages Djerba
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Avatar initials="S" color="bg-violet-500" />
                              Sahara Voyages Sousse
                            </span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIVITÉ RÉCENTE — le « pouls ». Réservations/paiements attendent
                  leurs modules → « à venir » (voir docs/backlog/en-attente-donnees). */}
              <div className="mt-8 mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Activity className="size-4 text-gray-500" /> Activité récente
              </div>
              <div className="rounded-xl border border-gray-200">
                {[
                  {
                    who: 'Yasmine Gharbi',
                    act: 'a ajouté une note',
                    c: 'bg-violet-500',
                    w: 'il y a 2 h',
                    pending: false,
                  },
                  {
                    who: 'Plafond Hébergement',
                    act: 'relevé à 550 000 TND',
                    c: 'bg-blue-500',
                    w: 'il y a 3 j',
                    pending: false,
                  },
                  {
                    who: 'Réservation #1287',
                    act: 'créée',
                    c: 'bg-emerald-500',
                    w: 'il y a 5 j',
                    pending: true,
                  },
                  {
                    who: 'Paiement 12 000 TND',
                    act: 'encaissé',
                    c: 'bg-teal-500',
                    w: 'il y a 6 j',
                    pending: true,
                  },
                ].map((e) => (
                  <div
                    key={e.who}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`size-2 shrink-0 rounded-full ${e.c}`} />
                      <span className="truncate">
                        <span className="font-medium">{e.who}</span>{' '}
                        <span className="text-gray-500">{e.act}</span>
                      </span>
                      {e.pending ? (
                        <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                          à venir
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-sm text-gray-400">
                      {e.w}
                    </span>
                  </div>
                ))}
              </div>

              {/* INTERLOCUTEURS — contacts EXTERNES du client. Secondaire = joignabilité
                  (tél/e-mail), pas une « dernière connexion » qui n'a pas de sens ici. */}
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4 text-gray-500" /> Interlocuteurs
                  <span className="text-xs font-normal text-gray-400">
                    · contacts chez le client
                  </span>
                  <ChevronDown className="size-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTab('team')}
                    className="text-xs font-medium text-blue-600"
                  >
                    Voir tout
                  </button>
                  <Plus className="size-4 text-gray-400" />
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-gray-200">
                {[
                  {
                    a: 'YG',
                    c: 'bg-violet-500',
                    n: 'Yasmine Gharbi',
                    f: 'Gérant',
                    tel: '+216 22 111 222',
                    mail: 'y.gharbi@sahara.tn',
                  },
                  {
                    a: 'KB',
                    c: 'bg-sky-500',
                    n: 'Karim Belhadj',
                    f: 'Comptable',
                    tel: '+216 55 333 444',
                    mail: 'k.belhadj@sahara.tn',
                  },
                  {
                    a: 'SB',
                    c: 'bg-rose-400',
                    n: 'Sarah Ben Salah',
                    f: 'Agent',
                    tel: '+216 98 555 666',
                    mail: 's.bensalah@sahara.tn',
                  },
                ].map((r) => (
                  <div
                    key={r.n}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar initials={r.a} color={r.c} />
                      <span className="w-40 shrink-0 font-medium">{r.n}</span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {r.f}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <Phone className="size-3.5 text-gray-400" /> {r.tel}
                      </span>
                      <a className="inline-flex items-center gap-1.5 text-blue-600">
                        <Mail className="size-3.5" /> {r.mail}
                      </a>
                    </span>
                  </div>
                ))}
              </div>

              {/* CHARGÉS DE COMPTE — VOTRE ÉQUIPE (interne), distinct des
                  interlocuteurs. Secondaire = leur bureau (utile), pas un timestamp. */}
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Briefcase className="size-4 text-gray-500" /> Chargés de
                  compte
                  <span className="text-xs font-normal text-gray-400">
                    · votre équipe
                  </span>
                  <ChevronDown className="size-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTab('team')}
                    className="text-xs font-medium text-blue-600"
                  >
                    Voir tout
                  </button>
                  <Plus className="size-4 text-gray-400" />
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-gray-200">
                {[
                  {
                    a: 'NH',
                    c: 'bg-emerald-500',
                    n: 'Nizar Hamdi',
                    f: 'Commercial',
                    office: 'myGO Tunis-Arbi',
                  },
                  {
                    a: 'FZ',
                    c: 'bg-amber-500',
                    n: 'Fatma Zouari',
                    f: 'Recouvrement',
                    office: 'myGO Sfax',
                  },
                ].map((r) => (
                  <div
                    key={r.n}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar initials={r.a} color={r.c} />
                      <span className="w-40 shrink-0 font-medium">{r.n}</span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {r.f}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm text-gray-500">
                      {r.office}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ───────── Contenu droite — indépendant : défile tout seul s'il dépasse,
            sinon fixe ; ne force plus la hauteur du centre. ───────── */}
        <div className="ref-scroll pe-4 pt-5 lg:min-h-0 lg:overflow-y-auto lg:ps-6 lg:pe-6">
          {/* Champs du rail — le repli est piloté par « Détails société » sur la bande. */}
          {railOpen ? (
            <div className="text-sm">
              {/* FINANCE — plafond PAR PORTÉE (bureau·produit, sinon demi-info) ;
                  Encours & Crédit dispo en attente (docs/backlog/en-attente-donnees). */}
              <div className="mb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                Finance
              </div>
              <Row icon={<DollarSign />} label="Plafond effectif">
                <span className="flex flex-col items-end gap-0.5">
                  <span>
                    <span className="text-gray-500">Hébergement</span>{' '}
                    <span className="font-semibold text-gray-900">
                      550 000 TND
                    </span>
                  </span>
                  <span>
                    <span className="text-gray-500">Vols</span>{' '}
                    <span className="font-semibold text-gray-900">
                      200 000 TND
                    </span>
                  </span>
                </span>
              </Row>
              <Row icon={<DollarSign />} label="Encours">
                <span className="inline-flex items-center gap-1.5 text-gray-400">
                  —
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                    en attente
                  </span>
                </span>
              </Row>
              <Row icon={<DollarSign />} label="Crédit disponible">
                <span className="inline-flex items-center gap-1.5 text-gray-400">
                  —
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                    en attente
                  </span>
                </span>
              </Row>
              <Row icon={<DollarSign />} label="Devise d'affichage">
                TND
              </Row>
              <Row icon={<DollarSign />} label="Devise de facturation">
                EUR — Euro
              </Row>

              <div className="mt-5 mb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                Coordonnées
              </div>
              <Row icon={<Phone />} label="Téléphone">
                <span className="inline-flex items-center gap-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    +216 71 111 111{' '}
                    <Copy className="size-3.5 shrink-0 text-gray-400" />
                  </span>
                  <span className="inline-flex items-center gap-1">
                    +216 52 557 390{' '}
                    <Copy className="size-3.5 shrink-0 text-gray-400" />
                  </span>
                </span>
              </Row>
              <Row icon={<Mail />} label="E-mail">
                <span className="inline-flex flex-col items-end gap-1">
                  <a className="text-blue-600">contact@sahara-voyages.tn</a>
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-amber-700">
                    Non vérifié
                  </span>
                </span>
              </Row>
              <Row icon={<Globe />} label="Site web">
                <a className="inline-flex items-center gap-1 text-blue-600">
                  sahara-voyages.tn <ArrowUpRight className="size-3.5" />
                </a>
              </Row>
              <Row icon={<MapPin />} label="Localisation">
                Avenue Habib Bourguiba, Tunis
              </Row>

              <div className="mt-5 mb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                Identité
              </div>
              <Row icon={<Building2 />} label="Nature">
                Organisation
              </Row>
              <Row icon={<Handshake />} label="Rôles">
                <span className="flex flex-wrap gap-1.5">
                  {['Client', 'Fournisseur'].map((role) => (
                    <span
                      key={role}
                      className={`rounded px-2 py-0.5 text-xs ${ROLE_STYLE[role] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {role}
                    </span>
                  ))}
                </span>
              </Row>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[168px_1fr] items-center gap-3 py-2.5">
      <span className="flex items-center gap-2 text-gray-500">
        <span className="[&_svg]:size-4 [&_svg]:text-gray-400">{icon}</span>
        {label}
      </span>
      <span className="min-w-0">{children}</span>
    </div>
  )
}
