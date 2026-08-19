import { useIntl } from 'react-intl'
import { Hotel, Plane, Car } from 'lucide-react'
import { StatusChip, type StatusTone } from '@/shared/ui/status-chip'
import { MockValue } from '@/shared/ui/mock-value'
import { EmptyState } from '@/shared/ui/empty-state'
import { Num } from '@/shared/ui/num'
import { cn } from '@/shared/lib/cn'

/**
 * VOYAGES EN COURS — ce que le client a acheté, en haut de sa fiche.
 *
 * Pourquoi ce bloc ouvre la fiche plutôt qu'une rangée d'indicateurs financiers :
 * un encours, un chiffre d'affaires et un impayé, tous les CRM les affichent. Rien
 * là-dedans ne dit qu'on vend du voyage. Ici la fiche s'ouvre sur un numéro de
 * dossier, une destination, des dates — et sous ce numéro les services (hôtel, vol,
 * transfert), chacun avec SON statut.
 *
 * Le statut est par SERVICE, jamais par dossier : un voyage peut être à moitié ferme,
 * l'hôtel confirmé et la voiture encore en option. Un badge unique en tête mentirait.
 *
 * La barre montre le poids de chaque service dans le séjour. Aucun autre outil de
 * gestion ne peut la dessiner — il faut le modèle dossier → services pour l'avoir.
 *
 * ⚠️ ENTIÈREMENT STATIQUE. Le module Réservations n'est pas branché : `/booking-folders`
 * ne rend aujourd'hui aucun dossier. Chaque valeur est marquée, et le compteur
 * d'en-tête les totalise. À remplacer par la vraie lecture dès que les dossiers
 * seront lisibles — voir docs/backlog/en-attente-donnees.md.
 */

type LegKind = 'hotel' | 'flight' | 'car'

interface Leg {
  readonly kind: LegKind
  readonly label: string
  readonly tone: StatusTone
  /** Poids du service dans le séjour, en pourcentage de la barre. */
  readonly weight: number
}

interface Trip {
  readonly reference: string
  readonly destination: string
  readonly pax: number
  readonly from: string
  readonly to: string
  readonly stateLabel: string
  readonly stateTone: StatusTone
  readonly footLabel: string
  readonly footValue: string
  readonly footTone?: 'default' | 'danger' | 'warning'
  readonly legs: readonly Leg[]
}

const LEG_ICON: Record<LegKind, typeof Hotel> = {
  hotel: Hotel,
  flight: Plane,
  car: Car,
}

/** Teintes de la barre — dérivées de l'accent, jamais des couleurs d'état. */
const LEG_BAR: Record<LegKind, string> = {
  hotel: 'bg-primary',
  flight: 'bg-primary/70',
  car: 'bg-primary/40',
}

const DOT: Record<StatusTone, string> = {
  neutral: 'bg-muted-foreground',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-destructive',
  info: 'bg-[var(--color-info)]',
}

export function PartyTripsCard({ trips }: { trips: readonly Trip[] }) {
  const intl = useIntl()
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values)

  const paxTotal = trips.reduce((sum, trip) => sum + trip.pax, 0)

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-foreground text-[15px] font-semibold">
            {t('party.trips.title')}
          </h2>
          <MockValue
            reason="Dossiers du client : /booking-folders ne rend encore aucun dossier."
            className="text-muted-foreground text-2sm tabular-nums"
          >
            {t('party.trips.meta', { folders: trips.length, pax: paxTotal })}
          </MockValue>
        </div>
        <button
          type="button"
          className="text-primary text-2sm font-medium hover:underline"
        >
          {t('party.trips.all')}
        </button>
      </div>

      {trips.length === 0 ? (
        <EmptyState className="border-border rounded-xl border">
          {t('party.trips.empty')}
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <article
              key={trip.reference}
              className="border-border bg-card flex flex-col overflow-hidden rounded-xl border"
            >
              <header className="border-border/60 bg-strip flex items-center justify-between gap-2 border-b px-3 py-2">
                {/* Le numéro se lit par groupes de trois — c'est ainsi qu'un client
                    le dicte au téléphone. Les espaces sont un habillage : la donnée
                    envoyée au serveur reste collée. */}
                <MockValue
                  reason="Numéro de dossier : à lire depuis /booking-folders."
                  className="text-foreground text-2sm font-semibold tracking-wide"
                >
                  <Num>{trip.reference}</Num>
                </MockValue>
                <StatusChip tone={trip.stateTone}>{trip.stateLabel}</StatusChip>
              </header>

              <div className="flex flex-col gap-2.5 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <MockValue
                    reason="Destination : dérivée du service d'hébergement du dossier."
                    className="text-foreground text-lg font-semibold"
                  >
                    {trip.destination}
                  </MockValue>
                  <MockValue
                    reason="Nombre de voyageurs : table travelers du dossier."
                    className="text-muted-foreground text-xs"
                  >
                    <Num>{t('party.trips.pax', { count: trip.pax })}</Num>
                  </MockValue>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="bg-muted flex h-1.5 overflow-hidden rounded-full">
                    {trip.legs.map((leg) => (
                      <span
                        key={leg.label}
                        className={LEG_BAR[leg.kind]}
                        style={{ width: `${leg.weight}%` }}
                      />
                    ))}
                  </div>
                  <div className="text-muted-foreground text-2xs flex items-center justify-between tabular-nums">
                    <MockValue reason="Date de début du séjour.">
                      {trip.from}
                    </MockValue>
                    <MockValue reason="Date de fin du séjour.">
                      {trip.to}
                    </MockValue>
                  </div>
                </div>

                <ul className="flex flex-col gap-1.5">
                  {trip.legs.map((leg) => {
                    const Icon = LEG_ICON[leg.kind]
                    return (
                      <li
                        key={leg.label}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Icon className="text-muted-foreground size-3.5 shrink-0" />
                          <MockValue
                            reason="Service du dossier : hôtel, vol ou location."
                            className="text-foreground truncate text-xs"
                          >
                            {leg.label}
                          </MockValue>
                        </span>
                        <span
                          className={cn(
                            'size-1.5 shrink-0 rounded-full',
                            DOT[leg.tone]
                          )}
                        />
                      </li>
                    )
                  })}
                </ul>
              </div>

              <footer className="border-border/60 flex items-baseline justify-between gap-2 border-t px-3 py-2">
                <span className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
                  {trip.footLabel}
                </span>
                <MockValue
                  reason="Montant du dossier : totaux par service, module Réservations."
                  className={cn(
                    'text-sm font-semibold',
                    trip.footTone === 'danger'
                      ? 'text-destructive'
                      : trip.footTone === 'warning'
                        ? 'text-[var(--color-warning-foreground)]'
                        : 'text-foreground'
                  )}
                >
                  <Num>{trip.footValue}</Num>
                </MockValue>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Jeu de démonstration, le temps que les dossiers soient lisibles. Il vit ICI et non
 * dans la page : le jour où l'API répond, on supprime cette constante et on branche
 * la requête — rien d'autre ne bouge.
 */
export function demoTrips(
  t: (id: string, values?: Record<string, string | number>) => string
): readonly Trip[] {
  return [
    {
      reference: '524 568 521',
      destination: 'Djerba',
      pax: 4,
      from: '12 sept.',
      to: '19 sept.',
      stateLabel: t('party.trips.state.confirmed'),
      stateTone: 'success',
      footLabel: t('party.trips.foot.sold'),
      footValue: '11 240,500 TND',
      legs: [
        {
          kind: 'hotel',
          label: 'Radisson Blu · 7 nuits',
          tone: 'success',
          weight: 58,
        },
        {
          kind: 'flight',
          label: 'TUN → DJE · A/R',
          tone: 'success',
          weight: 26,
        },
        {
          kind: 'car',
          label: 'Transfert aéroport',
          tone: 'success',
          weight: 16,
        },
      ],
    },
    {
      reference: '524 568 604',
      destination: 'Istanbul',
      pax: 2,
      from: '3 oct.',
      to: '9 oct.',
      stateLabel: t('party.trips.state.partial'),
      stateTone: 'warning',
      footLabel: t('party.trips.foot.option'),
      footValue: '28 août',
      footTone: 'warning',
      legs: [
        {
          kind: 'hotel',
          label: 'Hilton Bosphorus · 6 nuits',
          tone: 'warning',
          weight: 64,
        },
        {
          kind: 'flight',
          label: 'TUN → IST · A/R',
          tone: 'success',
          weight: 36,
        },
      ],
    },
    {
      reference: '524 569 018',
      destination: 'Paris',
      pax: 5,
      from: '22 août',
      to: '27 août',
      stateLabel: t('party.trips.state.soon', { days: 3 }),
      stateTone: 'danger',
      footLabel: t('party.trips.foot.due'),
      footValue: '3 900,000 TND',
      footTone: 'danger',
      legs: [
        {
          kind: 'hotel',
          label: 'Citadines Opéra · 5 nuits',
          tone: 'success',
          weight: 70,
        },
        {
          kind: 'car',
          label: 'Location · Clio 5 places',
          tone: 'danger',
          weight: 30,
        },
      ],
    },
  ]
}
