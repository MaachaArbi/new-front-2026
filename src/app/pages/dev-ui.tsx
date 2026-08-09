import * as React from 'react'
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Users,
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
      ['--bg' as string]: '#F8FAFC',
      ['--card' as string]: '#FFFFFF',
      ['--line' as string]: '#E9EEF5',
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
      'Plus Jakarta Sans · boutons encre · neutres chauds · accent sarcelle · rayons 10',
    font: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    vars: {
      ['--bg' as string]: '#FAFAF9',
      ['--card' as string]: '#FFFFFF',
      ['--line' as string]: '#E7E5E4',
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

function Card({
  children,
  className = '',
  pad = true,
}: {
  children: React.ReactNode
  className?: string
  pad?: boolean
}) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        padding: pad ? 20 : 0,
      }}
    >
      {children}
    </div>
  )
}

function SectionHead({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4">
      <div className="flex items-start gap-2.5">
        {icon ? (
          <span style={{ color: 'var(--faint)' }} className="mt-0.5">
            {icon}
          </span>
        ) : null}
        <div>
          <h3
            className="text-[17px] leading-6 font-semibold"
            style={{ color: 'var(--ink)', letterSpacing: 'var(--track)' }}
          >
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-[13px]" style={{ color: 'var(--muted)' }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  )
}

function BtnPrimary({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 shrink-0 items-center gap-1.5 px-3.5 text-[13px] font-semibold transition-opacity hover:opacity-90"
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
      className="inline-flex h-9 shrink-0 items-center gap-1.5 px-3 text-[13px] font-semibold"
      style={{
        background: 'var(--card)',
        color: 'var(--ink)',
        border: '1px solid var(--line)',
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
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--ink)',
}

/* ─────────────── l'écran, rendu à l'identique dans les 2 peaux ─────────────── */

function Screen({ skin }: { skin: Skin }) {
  return (
    <div
      style={{
        ...skin.vars,
        background: 'var(--bg)',
        fontFamily: skin.font,
        color: 'var(--ink)',
      }}
      className="p-6"
    >
      {/* Bandeau nom — le chrome respire */}
      <div className="mb-6 flex items-center gap-3">
        <span
          className="inline-flex size-12 shrink-0 items-center justify-center"
          style={{
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Building2 className="size-6" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className="text-[22px] leading-7 font-bold"
              style={{ letterSpacing: 'var(--track)' }}
            >
              Groupe Sahara Voyages
            </h1>
            <Pencil className="size-4" style={{ color: 'var(--faint)' }} />
            <Chip tone="ok">● Actif</Chip>
          </div>
          <p className="mt-0.5 text-[13px]" style={{ color: 'var(--muted)' }}>
            Client · Fournisseur · myGO Tunis-Arbi
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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          {/* À TRAITER */}
          <Card pad={false}>
            <div className="px-5 pt-4">
              <SectionHead
                icon={<AlertTriangle className="size-[18px]" />}
                title="À traiter"
                subtitle="3 points demandent une action."
              />
            </div>
            <div>
              {[
                ['E-mail non vérifié', 'Vérifier', '#F43F5E'],
                ['Exonération TVA sans justificatif', 'Ajouter', '#F43F5E'],
                ['Rallonge Hébergement expire le 11/08', 'Voir', '#F59E0B'],
              ].map(([txt, cta, dot], i) => (
                <div
                  key={txt}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                  style={{
                    borderTop: i === 0 ? '1px solid var(--line)' : undefined,
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <span className="flex min-w-0 items-center gap-3 text-[14px]">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: dot }}
                    />
                    {txt}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-[13px] font-semibold"
                    style={{ color: 'var(--accent)' }}
                  >
                    {cta}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* CHIFFRES-CLÉS — traités comme des chiffres, pas comme des lignes */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Plafond effectif', '550 000', 'TND', 'Hébergement'],
              ['Encours', '—', '', 'en attente'],
              ['Crédit disponible', '—', '', 'en attente'],
            ].map(([label, val, cur, note]) => (
              <Card key={label}>
                <div
                  className="text-[11px] font-semibold uppercase"
                  style={{ color: 'var(--faint)', letterSpacing: '.08em' }}
                >
                  {label}
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span
                    className="text-[26px] leading-8 font-bold tabular-nums"
                    style={{ letterSpacing: 'var(--track)' }}
                  >
                    {val}
                  </span>
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: 'var(--muted)' }}
                  >
                    {cur}
                  </span>
                </div>
                <div className="mt-1 text-[12px]" style={{ color: 'var(--muted)' }}>
                  {note}
                </div>
              </Card>
            ))}
          </div>

          {/* DONNÉES DENSES — la moitié « ERP » de la règle hybride */}
          <Card pad={false}>
            <div className="px-5 pt-4">
              <SectionHead
                icon={<Users className="size-[18px]" />}
                title="Interlocuteurs"
                subtitle="Contacts chez le client · 5"
                action={
                  <BtnGhost>
                    <Plus className="size-4" /> Ajouter
                  </BtnGhost>
                }
              />
            </div>
            <div
              className="grid grid-cols-[1fr_140px_180px_40px] px-5 py-2 text-[11px] font-semibold uppercase"
              style={{
                color: 'var(--faint)',
                letterSpacing: '.06em',
                borderTop: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                background: 'var(--bg)',
              }}
            >
              <span>Nom</span>
              <span>Fonction</span>
              <span>Téléphone</span>
              <span />
            </div>
            {[
              ['YG', 'Yasmine Gharbi', 'Gérant', '+216 22 111 222', '#7C3AED'],
              ['KB', 'Karim Belhadj', 'Comptable', '+216 55 333 444', '#0EA5E9'],
              ['SB', 'Sarah Ben Salah', 'Agent', '+216 98 555 666', '#F43F5E'],
              ['MT', 'Mohamed Trabelsi', 'Achats', '+216 71 222 333', '#14B8A6'],
            ].map(([ini, name, fn, tel, tint]) => (
              <div
                key={name}
                className="grid grid-cols-[1fr_140px_180px_40px] items-center px-5 text-[14px]"
                style={{ height: 44, borderBottom: '1px solid var(--line)' }}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar initials={ini ?? ''} tint={tint ?? '#888'} />
                  <span className="truncate font-medium">{name}</span>
                </span>
                <span style={{ color: 'var(--muted)' }}>{fn}</span>
                <span className="tabular-nums" style={{ color: 'var(--muted)' }}>
                  {tel}
                </span>
                <X className="size-4 justify-self-end" style={{ color: 'var(--faint)' }} />
              </div>
            ))}
          </Card>
        </div>

        {/* Rail */}
        <div className="flex flex-col gap-5">
          <Card>
            <SectionHead
              icon={<LayoutGrid className="size-[18px]" />}
              title="Identité"
              action={<Pencil className="size-4" style={{ color: 'var(--faint)' }} />}
            />
            <dl className="flex flex-col gap-3 text-[14px]">
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
          </Card>

          <Card>
            <SectionHead title="Coordonnées" />
            <div className="flex flex-col gap-3 text-[14px]">
              <div className="flex items-baseline justify-between gap-3">
                <span style={{ color: 'var(--muted)' }}>Téléphone</span>
                <span className="tabular-nums font-medium">+216 71 111 111</span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span style={{ color: 'var(--muted)' }}>E-mail</span>
                <span className="flex flex-col items-end gap-1">
                  <a style={{ color: 'var(--accent)' }} className="font-medium">
                    contact@sahara.tn
                  </a>
                  <Chip tone="warn">Non vérifié</Chip>
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODALE CRUD — le point où l'écart se voit le plus */}
      <div className="mt-8">
        <div
          className="mb-2 text-[11px] font-semibold uppercase"
          style={{ color: 'var(--faint)', letterSpacing: '.08em' }}
        >
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
              <h2
                className="text-[19px] leading-6 font-bold"
                style={{ letterSpacing: 'var(--track)' }}
              >
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
              <div
                className="flex items-center justify-between px-3 text-[14px]"
                style={inputStyle}
              >
                myGO Tunis-Arbi
                <ChevronDown className="size-4" style={{ color: 'var(--faint)' }} />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type de service">
                <div
                  className="flex items-center justify-between px-3 text-[14px]"
                  style={inputStyle}
                >
                  Hébergement
                  <ChevronDown className="size-4" style={{ color: 'var(--faint)' }} />
                </div>
              </Field>
              <Field label="Devise">
                <div
                  className="flex items-center justify-between px-3 text-[14px]"
                  style={inputStyle}
                >
                  TND
                  <ChevronDown className="size-4" style={{ color: 'var(--faint)' }} />
                </div>
              </Field>
            </div>
            <Field label="Montant" hint="Montant du socle, hors rallonges.">
              <div
                className="flex items-center gap-2 px-3 text-[14px]"
                style={inputStyle}
              >
                <span style={{ color: 'var(--faint)' }}>TND</span>
                <span className="font-medium tabular-nums">500 000,000</span>
                <Check
                  className="ms-auto size-4"
                  style={{ color: 'var(--accent)' }}
                />
              </div>
            </Field>
            <Field label="Recherche d'un bureau">
              <div
                className="flex items-center gap-2 px-3 text-[14px]"
                style={inputStyle}
              >
                <Search className="size-4" style={{ color: 'var(--faint)' }} />
                <span style={{ color: 'var(--faint)' }}>Rechercher…</span>
              </div>
            </Field>
          </div>

          <div
            className="flex items-center justify-between gap-3 px-6 py-4"
            style={{ borderTop: '1px solid var(--line)', background: 'var(--bg)' }}
          >
            <button
              type="button"
              className="text-[13px] font-semibold"
              style={{ color: '#DC2626' }}
            >
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
