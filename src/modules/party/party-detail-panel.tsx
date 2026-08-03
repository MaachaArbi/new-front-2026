import { useI18n } from '@/app/providers/i18n-provider'
import { usePartyAccount, usePartyAddresses } from './queries'
import type { PartyAddress } from './api'
import { countryName } from '@/shared/i18n/country'
import { ApiError } from '@/shared/api/errors'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from '@/shared/ui/sheet'
import { Badge } from '@/shared/ui/badge'
import { SkeletonText } from '@/shared/feedback'

/**
 * Panneau de détail d'un tiers (ADR-F20.1/.2), adressable via `?open=<publicId>`.
 * Affiche l'identité de base + les adresses (seule sous-ressource lisible, §5).
 * Pays localisé via `Intl` ; erreurs avec `X-Request-Id`.
 */
function ErrorNote({ error }: { error: unknown }) {
  const { t } = useI18n()
  const requestId = error instanceof ApiError ? error.requestId : null
  return (
    <p className="text-destructive text-sm" role="alert">
      {t('party.error')}
      {requestId ? (
        <span className="text-muted-foreground block text-xs">
          {t('error.requestId')} {requestId}
        </span>
      ) : null}
    </p>
  )
}

function AddressLine({
  address,
  locale,
}: {
  address: PartyAddress
  locale: string
}) {
  const { t } = useI18n()
  const parts = [
    address.line1,
    address.line2,
    [address.postalCode, address.city].filter(Boolean).join(' '),
    countryName(address.countryAlpha2, locale),
  ].filter((value) => value && value.length > 0)
  return (
    <li className="border-border flex flex-col gap-1 rounded-md border p-3">
      <span className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">
          {address.addressType}
        </span>
        {address.isPrimary ? (
          <Badge variant="success" size="sm" appearance="light">
            {t('party.address.primary')}
          </Badge>
        ) : null}
      </span>
      <span className="text-foreground text-sm">{parts.join(', ')}</span>
    </li>
  )
}

export function PartyDetailPanel({
  publicId,
  onClose,
}: {
  publicId: string | null
  onClose: () => void
}) {
  const { t, currentLanguage } = useI18n()
  const detail = usePartyAccount(publicId)
  const addresses = usePartyAddresses(publicId)

  return (
    <Sheet
      open={publicId !== null}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {detail.data?.displayName ?? t('party.detail.title')}
          </SheetTitle>
          {detail.data ? (
            <SheetDescription>
              <Badge variant="secondary" size="sm">
                {t(`party.nature.${detail.data.nature}`)}
              </Badge>
            </SheetDescription>
          ) : null}
        </SheetHeader>

        <SheetBody className="flex flex-col gap-5">
          {detail.isLoading ? (
            <SkeletonText lines={3} />
          ) : detail.error ? (
            <ErrorNote error={detail.error} />
          ) : detail.data ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">
                  {t('party.detail.email')}
                </span>
                <span className="text-foreground text-sm">
                  {detail.data.email ?? '—'}
                </span>
              </div>

              <section className="flex flex-col gap-2">
                <h3 className="text-foreground text-sm font-medium">
                  {t('party.detail.addresses')}
                </h3>
                {addresses.isLoading ? (
                  <SkeletonText lines={2} />
                ) : addresses.error ? (
                  <ErrorNote error={addresses.error} />
                ) : addresses.data && addresses.data.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {addresses.data.map((address) => (
                      <AddressLine
                        key={address.publicId}
                        address={address}
                        locale={currentLanguage}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {t('party.detail.noAddresses')}
                  </p>
                )}
              </section>
            </>
          ) : null}
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
