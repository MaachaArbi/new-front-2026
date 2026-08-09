import * as React from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Filter,
  Building2,
  Check,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  X,
} from 'lucide-react'

/**
 * Page JETABLE `/_ui` — comparaison de DEUX directions visuelles sur le même contenu.
 * But : trancher police / accent / ombres / rayons / échelle typographique à l'œil,
 * avant de figer les tokens puis les composants partagés. À SUPPRIMER après décision.
 *
 * Règle commune aux deux (direction « hybride » validée) : le CHROME respire
 * (en-têtes, cartes, modales, formulaires), les DONNÉES restent denses (tableaux).
 */

type Skin = {
  id: 'A' | 'B'
  name: string
  pitch: string
  font: string
  /** Variables CSS appliquées au conteneur. */
  vars: React.CSSProperties
}

const SKINS: Skin[] = [
  {
    id: 'A',
    name: 'Clarté',
    pitch: 'Inter · accent indigo · neutres froids · ombres douces · rayons 14',
    font: "'Inter', ui-sans-serif, system-ui, sans-serif",
    vars: {
      ['--page' as string]: '#FFFFFF',
      ['--strip' as string]: '#F8FAFC',
      ['--bg' as string]: '#F8FAFC',
      ['--card' as string]: '#FFFFFF',
      ['--line' as string]: '#E9EEF5',
      ['--line-strong' as string]: '#CFD6E0',
      ['--ink' as string]: '#0F172A',
      ['--muted' as string]: '#64748B',
      ['--faint' as string]: '#94A3B8',
      ['--accent' as string]: '#4F46E5',
      ['--accent-soft' as string]: '#EEF2FF',
      ['--btn' as string]: '#4F46E5',
      ['--btn-ink' as string]: '#FFFFFF',
      ['--radius' as string]: '14px',
      ['--radius-sm' as string]: '10px',
      ['--shadow' as string]:
        '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.04)',
      ['--shadow-lg' as string]:
        '0 20px 24px -4px rgba(16,24,40,.10), 0 8px 8px -4px rgba(16,24,40,.04)',
      ['--field-h' as string]: '44px',
      ['--track' as string]: '-0.011em',
    },
  },
  {
    id: 'B',
    name: 'Encre',
    pitch:
      'Inter (full demo) · boutons encre · neutres chauds · accent sarcelle · rayons 10',
    font: "'Inter', ui-sans-serif, system-ui, sans-serif",
    vars: {
      ['--page' as string]: '#FFFFFF',
      ['--strip' as string]: '#FAFAF9',
      ['--bg' as string]: '#FAFAF9',
      ['--card' as string]: '#FFFFFF',
      ['--line' as string]: '#E7E5E4',
      ['--line-strong' as string]: '#D2CFCC',
      ['--ink' as string]: '#1C1917',
      ['--muted' as string]: '#78716C',
      ['--faint' as string]: '#A8A29E',
      ['--accent' as string]: '#0F766E',
      ['--accent-soft' as string]: '#ECFDF5',
      ['--btn' as string]: '#1C1917',
      ['--btn-ink' as string]: '#FFFFFF',
      ['--radius' as string]: '10px',
      ['--radius-sm' as string]: '8px',
      ['--shadow' as string]: '0 1px 2px rgba(28,25,23,.07)',
      ['--shadow-lg' as string]:
        '0 24px 32px -8px rgba(28,25,23,.14), 0 6px 12px -6px rgba(28,25,23,.06)',
      ['--field-h' as string]: '42px',
      ['--track' as string]: '-0.02em',
    },
  },
]

/* ─────────────── primitives de la maquette (locales, jetables) ─────────────── */

function BtnPrimary({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 shrink-0 items-center gap-1.5 px-3.5 text-[13px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      style={{
        background: 'var(--btn)',
        color: 'var(--btn-ink)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {children}
    </button>
  )
}

function BtnGhost({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 shrink-0 items-center gap-1.5 px-3 text-[13px] font-semibold transition-colors hover:bg-[var(--strip)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      style={{
        background: 'var(--card)',
        color: 'var(--ink)',
        border: '1px solid var(--line-strong)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {children}
    </button>
  )
}

function Chip({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'warn' | 'ok' | 'bad'
}) {
  const tones: Record<string, React.CSSProperties> = {
    neutral: { background: '#F1F5F9', color: '#475569' },
    warn: { background: '#FEF3C7', color: '#92400E' },
    ok: { background: '#DCFCE7', color: '#166534' },
    bad: { background: '#FEE2E2', color: '#991B1B' },
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={tones[tone]}
    >
      {children}
    </span>
  )
}

function Avatar({ initials, tint }: { initials: string; tint: string }) {
  return (
    <span
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ background: tint }}
    >
      {initials}
    </span>
  )
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-[12px]" style={{ color: 'var(--muted)' }}>
          {hint}
        </span>
      ) : null}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  height: 'var(--field-h)',
  background: 'var(--card)',
  border: '1px solid var(--line-strong)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--ink)',
}



/* ══════════════ VOCABULAIRE CRM — les briques qui manquaient ══════════════ */

/** Bande de titre de carte (device signature Metronic). */
function CardHead({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5"
      style={{ borderBottom: '1px solid var(--line)', background: 'var(--strip)' }}
    >
      <span className="text-[16px] leading-none font-semibold tracking-tight">{title}</span>
      {action}
    </div>
  )
}

/** Variation chiffrée : ↗ +18 % (vert) / ↘ −4 % (rouge). */
function Delta({ value, up }: { value: string; up: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold"
      style={{
        background: up ? '#DCFCE7' : '#FEE2E2',
        color: up ? '#15803D' : '#B91C1C',
      }}
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {value}
    </span>
  )
}

/** Sparkline — SVG inline, aucun dépendance. */
function Spark({ points, tint }: { points: number[]; tint: string }) {
  const w = 150
  const h = 40
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / span) * (h - 6) - 3
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const id = `g${tint.replace(/[^a-z0-9]/gi, '')}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint} stopOpacity="0.28" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={tint} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

/** Bloc KPI : label · grand chiffre · variation · sparkline. */
function Kpi({
  label,
  period,
  value,
  unit,
  delta,
  up,
  points,
  tint,
  ranges,
  activeRange,
}: {
  label: string
  /** Période couverte — SANS elle, « +18 % » ne veut rien dire. */
  period: string
  value: string
  unit?: string
  delta?: string
  up?: boolean
  points: number[]
  tint: string
  ranges?: string[]
  activeRange?: string
}) {
  const last = points[points.length - 1] ?? 0
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const lastY = 40 - ((last - min) / span) * 34 - 3
  return (
    <div
      className="overflow-hidden"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
      }}
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-3.5">
        <div>
          <div
            className="text-[11px] font-semibold uppercase"
            style={{ color: 'var(--faint)', letterSpacing: '.07em' }}
          >
            {label}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className="text-[24px] leading-7 font-bold tabular-nums"
              style={{ letterSpacing: 'var(--track)' }}
            >
              {value}
            </span>
            {unit ? (
              <span className="text-[13px] font-medium" style={{ color: 'var(--muted)' }}>
                {unit}
              </span>
            ) : null}
            {delta ? <Delta value={delta} up={!!up} /> : null}
          </div>
        </div>
        {/* Sélecteur de période — le repère qui manquait. */}
        {ranges ? (
          <div className="flex items-center gap-0.5 p-0.5"
            style={{ background: 'var(--strip)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
            {ranges.map((r) => (
              <span
                key={r}
                className="rounded px-1.5 py-0.5 text-[11px] font-semibold"
                style={
                  r === activeRange
                    ? { background: 'var(--card)', color: 'var(--ink)', boxShadow: 'var(--shadow)' }
                    : { color: 'var(--faint)' }
                }
              >
                {r}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative">
        <Spark points={points} tint={tint} />
        {/* Point terminal — l'œil sait où « maintenant » se trouve. */}
        <svg viewBox="0 0 150 40" className="pointer-events-none absolute inset-0 h-10 w-full" preserveAspectRatio="none">
          <circle cx="149" cy={lastY} r="2.5" fill={tint} />
        </svg>
      </div>
      <div className="px-4 pt-1 pb-3 text-[11px]" style={{ color: 'var(--faint)' }}>
        {period}
      </div>
    </div>
  )
}

/** Jauge d'utilisation (encours / plafond). */
function Gauge({
  used,
  total,
  label,
}: {
  used: number
  total: number
  label: string
}) {
  const pct = Math.min(100, Math.round((used / total) * 100))
  const tone = pct > 85 ? '#DC2626' : pct > 60 ? '#F59E0B' : '#10B981'
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span className="font-semibold tabular-nums">{pct} %</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: tone }}
        />
      </div>
    </div>
  )
}

/** Segmented control (onglets façon layout-21). */
function Segmented({ items, active }: { items: string[]; active: string }) {
  return (
    <div
      className="inline-flex items-center gap-0.5 p-0.5"
      style={{ background: 'var(--strip)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
    >
      {items.map((it) => (
        <span
          key={it}
          className="rounded-md px-2.5 py-1 text-[13px] font-medium"
          style={
            it === active
              ? { background: 'var(--card)', color: 'var(--ink)', boxShadow: 'var(--shadow)' }
              : { color: 'var(--muted)' }
          }
        >
          {it}
        </span>
      ))}
    </div>
  )
}

/* ─────────────── l'écran, rendu à l'identique dans les 2 peaux ─────────────── */

function Screen({ skin }: { skin: Skin }) {
  return (
    <div
      style={{
        ...skin.vars,
        background: 'var(--page)',
        fontFamily: skin.font,
        color: 'var(--ink)',
      }}
      className="p-6"
    >
      {/* EN-TÊTE — logo, statut, méta, actions */}
      <div className="mb-5 flex items-center gap-3.5">
        <span
          className="inline-flex size-14 shrink-0 items-center justify-center"
          style={{
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)',
          }}
        >
          <Building2 className="size-7" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] leading-7 font-bold" style={{ letterSpacing: 'var(--track)' }}>
              Groupe Sahara Voyages
            </h1>
            <Pencil className="size-4" style={{ color: 'var(--faint)' }} />
            <Chip tone="ok">● Actif</Chip>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12.5px]" style={{ color: 'var(--muted)' }}>
            <span>MF 123456</span>
            <span style={{ color: 'var(--faint)' }}>·</span>
            <span>Client · Fournisseur</span>
            <span style={{ color: 'var(--faint)' }}>·</span>
            <span>myGO Tunis-Arbi</span>
            <span style={{ color: 'var(--faint)' }}>·</span>
            <span>Modifié il y a 2 h par Mehdi</span>
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <BtnPrimary>
            <Plus className="size-4" /> Nouvelle réservation
          </BtnPrimary>
          <BtnGhost>
            <MoreHorizontal className="size-4" />
          </BtnGhost>
        </div>
      </div>

      {/* BARRE : segmented + toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          items={['Vue d’ensemble', 'Finance', 'Historique', 'Contacts', 'Documents']}
          active="Vue d’ensemble"
        />
        <div className="flex items-center gap-2">
          <BtnGhost>
            <Filter className="size-4" /> Filtrer
          </BtnGhost>
          <BtnGhost>
            <Eye className="size-4" /> Vue
          </BtnGhost>
          <BtnGhost>
            <Search className="size-4" />
          </BtnGhost>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          {/* KPI + sparklines */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Kpi
              label="Chiffre d'affaires"
              value="248 500"
              unit="TND"
              delta="+18 %"
              up
              period="12 derniers mois · août 2025 → août 2026"
              ranges={['3M', '6M', '12M']}
              activeRange="12M"
              points={[12, 18, 15, 22, 19, 26, 24, 31, 29, 35, 33, 42]}
              tint="#6366F1"
            />
            <Kpi
              label="Réservations"
              value="126"
              delta="−4 %"
              up={false}
              period="12 derniers mois · août 2025 → août 2026"
              ranges={['3M', '6M', '12M']}
              activeRange="12M"
              points={[30, 28, 32, 26, 29, 24, 27, 22, 25, 21, 23, 20]}
              tint="#14B8A6"
            />
          </div>

          {/* À TRAITER — hiérarchie d'urgence : liseré ambre + bande teintée. */}
          <div
            className="overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderInlineStart: '3px solid #F59E0B',
              borderRadius: 'var(--radius)',
            }}
          >
            <div
              className="flex items-center justify-between gap-3 px-4 py-2.5"
              style={{
                borderBottom: '1px solid var(--line)',
                background: '#FFFBEB',
              }}
            >
              <span className="flex items-center gap-2 text-[16px] leading-none font-semibold tracking-tight">
                <AlertTriangle className="size-4" style={{ color: '#D97706' }} />
                À traiter
              </span>
              <Chip tone="warn">3</Chip>
            </div>
            {[
              ['E-mail non vérifié', 'Vérifier', '#F43F5E'],
              ['Exonération TVA sans justificatif', 'Ajouter', '#F43F5E'],
              ['Rallonge Hébergement expire le 11/08', 'Voir', '#F59E0B'],
            ].map(([txt, cta, dot], i, arr) => (
              <div
                key={txt}
                className="hover:bg-[var(--strip)] flex items-center justify-between gap-3 px-4 py-3 transition-colors"
                style={{
                  borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : undefined,
                }}
              >
                <span className="flex min-w-0 items-center gap-3 text-[13px]">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: dot }} />
                  {txt}
                </span>
                <button type="button" className="shrink-0 text-[12.5px] font-semibold" style={{ color: 'var(--accent)' }}>
                  {cta}
                </button>
              </div>
            ))}
          </div>

          {/* TABLEAU DENSE — la moitié « ERP » */}
          <div
            className="overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
            }}
          >
            <CardHead
              title="Interlocuteurs · 4"
              action={
                <BtnGhost>
                  <Plus className="size-4" /> Ajouter
                </BtnGhost>
              }
            />
            <div
              className="grid grid-cols-[1fr_130px_170px_90px_40px] px-4 py-2 text-[11px] font-semibold uppercase"
              style={{ color: 'var(--faint)', letterSpacing: '.06em', borderBottom: '1px solid var(--line)' }}
            >
              <span>Nom</span>
              <span>Fonction</span>
              <span>Téléphone</span>
              <span>Dernier contact</span>
              <span />
            </div>
            {[
              ['YG', 'Yasmine Gharbi', 'Gérant', '+216 22 111 222', 'il y a 2 j', '#7C3AED'],
              ['KB', 'Karim Belhadj', 'Comptable', '+216 55 333 444', 'il y a 9 j', '#0EA5E9'],
              ['SB', 'Sarah Ben Salah', 'Agent', '+216 98 555 666', 'il y a 1 mois', '#F43F5E'],
              ['MT', 'Mohamed Trabelsi', 'Achats', '+216 71 222 333', '—', '#14B8A6'],
            ].map(([ini, name, fn, tel, last, tint], i, arr) => (
              <div
                key={name}
                className="hover:bg-[var(--strip)] grid cursor-pointer grid-cols-[1fr_130px_170px_90px_40px] items-center px-4 text-[13px] transition-colors"
                style={{
                  height: 42,
                  borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : undefined,
                }}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar initials={ini ?? ''} tint={tint ?? '#888'} />
                  <span className="truncate font-medium">{name}</span>
                </span>
                <span style={{ color: 'var(--muted)' }}>{fn}</span>
                <span className="tabular-nums" style={{ color: 'var(--muted)' }}>{tel}</span>
                <span className="text-[12.5px]" style={{ color: 'var(--faint)' }}>{last}</span>
                <X className="size-4 justify-self-end" style={{ color: 'var(--faint)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* RAIL */}
        <div className="flex flex-col gap-5">
          {/* Jauge de crédit */}
          <div
            className="overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
            }}
          >
            <CardHead title="Crédit" />
            <div className="flex flex-col gap-3.5 p-4">
              <div>
                <div className="text-[11px] font-semibold uppercase" style={{ color: 'var(--faint)', letterSpacing: '.07em' }}>
                  Plafond effectif
                </div>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-[24px] leading-7 font-bold tabular-nums" style={{ letterSpacing: 'var(--track)' }}>
                    550 000
                  </span>
                  <span className="text-[13px] font-medium" style={{ color: 'var(--muted)' }}>TND</span>
                </div>
              </div>
              <Gauge used={412000} total={550000} label="Encours / plafond" />
              <div className="flex items-baseline justify-between text-[13px]">
                <span style={{ color: 'var(--muted)' }}>Crédit disponible</span>
                <span className="font-semibold tabular-nums">138 000 TND</span>
              </div>
            </div>
          </div>

          <div
            className="overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
            }}
          >
            <CardHead
              title="Identité"
              action={<Pencil className="size-4" style={{ color: 'var(--faint)' }} />}
            />
            <dl className="flex flex-col gap-3 p-4 text-[13px]">
              {[
                ['Matricule fiscal', 'MF : 123456'],
                ['Registre de commerce', 'RC : 123456'],
                ['Forme juridique', 'SARL'],
                ['Pays', 'Tunisie'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3">
                  <dt style={{ color: 'var(--muted)' }}>{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Chargés de compte — comble la colonne avec de l'utile, pas du remplissage. */}
          <div
            className="overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
            }}
          >
            <CardHead title="Chargés de compte" />
            <div className="flex flex-col">
              {[
                ['NH', 'Nizar Hamdi', 'Commercial', '#10B981'],
                ['FZ', 'Fatma Zouari', 'Recouvrement', '#F59E0B'],
              ].map(([ini, name, role, tint], i, arr) => (
                <div
                  key={name}
                  className="hover:bg-[var(--strip)] flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : undefined }}
                >
                  <Avatar initials={ini ?? ''} tint={tint ?? '#888'} />
                  <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
                  <span style={{ color: 'var(--muted)' }}>{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALE CRUD */}
      <div className="mt-8">
        <div className="mb-2 text-[11px] font-semibold uppercase" style={{ color: 'var(--faint)', letterSpacing: '.08em' }}>
          Modale CRUD
        </div>
        <div
          className="mx-auto max-w-[520px] overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="flex items-start justify-between gap-4 p-6 pb-4">
            <div>
              <h2 className="text-[19px] leading-6 font-bold" style={{ letterSpacing: 'var(--track)' }}>
                Ajouter un plafond
              </h2>
              <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
                Le plafond effectif = socle + rallonges actives, par bureau et produit.
              </p>
            </div>
            <X className="size-5 shrink-0" style={{ color: 'var(--faint)' }} />
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6">
            <Field label="Société">
              <div className="flex items-center justify-between px-3 text-[14px]" style={inputStyle}>
                myGO Tunis-Arbi
                <ChevronDown className="size-4" style={{ color: 'var(--faint)' }} />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type de service">
                <div className="flex items-center justify-between px-3 text-[14px]" style={inputStyle}>
                  Hébergement
                  <ChevronDown className="size-4" style={{ color: 'var(--faint)' }} />
                </div>
              </Field>
              <Field label="Devise">
                <div className="flex items-center justify-between px-3 text-[14px]" style={inputStyle}>
                  TND
                  <ChevronDown className="size-4" style={{ color: 'var(--faint)' }} />
                </div>
              </Field>
            </div>
            <Field label="Montant" hint="Montant du socle, hors rallonges.">
              <div className="flex items-center gap-2 px-3 text-[14px]" style={inputStyle}>
                <span style={{ color: 'var(--faint)' }}>TND</span>
                <span className="font-medium tabular-nums">500 000,000</span>
                <Check className="ms-auto size-4" style={{ color: 'var(--accent)' }} />
              </div>
            </Field>
          </div>
          <div
            className="flex items-center justify-between gap-3 px-6 py-4"
            style={{ borderTop: '1px solid var(--line)', background: 'var(--strip)' }}
          >
            <button type="button" className="text-[13px] font-semibold" style={{ color: '#DC2626' }}>
              Supprimer
            </button>
            <div className="flex items-center gap-2">
              <BtnGhost>Annuler</BtnGhost>
              <BtnPrimary>Enregistrer</BtnPrimary>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DevUiPage() {
  const [skin, setSkin] = React.useState<Skin>(SKINS[0] as Skin)
  return (
    <div className="-mt-4">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      />
      <div className="mb-4 flex flex-wrap items-center gap-3 px-4">
        {SKINS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSkin(s)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              skin.id === s.id
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Variante {s.id} — {s.name}
          </button>
        ))}
        <span className="text-xs text-gray-500">{skin.pitch}</span>
      </div>
      <Screen skin={skin} />
    </div>
  )
}
