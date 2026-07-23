import type { MenuConfig } from '@/shared/layout/menu.config'

/**
 * Contenu factice des menus de module (S3c §5) — libellés métier réalistes du
 * domaine agence de voyage, organisés en groupes de section, avec quelques
 * badges. TOUT passe par l'i18n (clés `menu.*` / `badge.*`, cf. messages/).
 *
 * Structure (ADR-F19) : un élément avec `children` est un GROUPE de section
 * (son `titleKey` est l'intitulé) ; un élément avec `path` est une entrée.
 *
 * À retirer quand l'API réelle alimentera la navigation (backlog).
 */
export const MODULE_MENUS: Record<string, MenuConfig> = {
  parties: [
    {
      titleKey: 'menu.parties.group.directory',
      children: [
        {
          titleKey: 'menu.parties.clients',
          path: '/parties/clients',
          permission: 'party.client.view',
        },
        {
          titleKey: 'menu.parties.suppliers',
          path: '/parties/suppliers',
          permission: 'party.supplier.view',
        },
        { titleKey: 'menu.parties.contacts', path: '/parties/contacts' },
        { titleKey: 'menu.parties.addresses', path: '/parties/addresses' },
      ],
    },
    {
      titleKey: 'menu.parties.group.finance',
      children: [
        { titleKey: 'menu.parties.balances', path: '/parties/balances' },
        { titleKey: 'menu.parties.statements', path: '/parties/statements' },
      ],
    },
  ],
  bookings: [
    {
      titleKey: 'menu.bookings.group.ops',
      children: [
        {
          titleKey: 'menu.bookings.list',
          path: '/bookings/list',
          badgeCount: 12,
        },
        { titleKey: 'menu.bookings.quotes', path: '/bookings/quotes' },
        { titleKey: 'menu.bookings.options', path: '/bookings/options' },
      ],
    },
    {
      titleKey: 'menu.bookings.group.detail',
      children: [
        { titleKey: 'menu.bookings.services', path: '/bookings/services' },
        { titleKey: 'menu.bookings.passengers', path: '/bookings/passengers' },
        { titleKey: 'menu.bookings.documents', path: '/bookings/documents' },
      ],
    },
  ],
  settlements: [
    {
      titleKey: 'menu.settlements.group.movements',
      children: [
        {
          titleKey: 'menu.settlements.receipts',
          path: '/settlements/receipts',
        },
        {
          titleKey: 'menu.settlements.payments',
          path: '/settlements/payments',
        },
      ],
    },
    {
      titleKey: 'menu.settlements.group.processing',
      children: [
        {
          titleKey: 'menu.settlements.matching',
          path: '/settlements/matching',
        },
        {
          titleKey: 'menu.settlements.reconciliation',
          path: '/settlements/reconciliation',
        },
        {
          titleKey: 'menu.settlements.statements',
          path: '/settlements/statements',
        },
      ],
    },
  ],
  cash: [
    {
      titleKey: 'menu.cash.group.journals',
      children: [
        { titleKey: 'menu.cash.journals', path: '/cash/journals' },
        { titleKey: 'menu.cash.movements', path: '/cash/movements' },
      ],
    },
    {
      titleKey: 'menu.cash.group.control',
      children: [
        { titleKey: 'menu.cash.reconciliation', path: '/cash/reconciliation' },
        { titleKey: 'menu.cash.closings', path: '/cash/closings' },
      ],
    },
  ],
  invoicing: [
    {
      titleKey: 'menu.invoicing.group.documents',
      children: [
        { titleKey: 'menu.invoicing.invoices', path: '/invoicing/invoices' },
        {
          titleKey: 'menu.invoicing.creditNotes',
          path: '/invoicing/credit-notes',
        },
        { titleKey: 'menu.invoicing.proforma', path: '/invoicing/proforma' },
      ],
    },
    {
      titleKey: 'menu.invoicing.group.tracking',
      children: [
        { titleKey: 'menu.invoicing.schedule', path: '/invoicing/schedule' },
        { titleKey: 'menu.invoicing.reminders', path: '/invoicing/reminders' },
      ],
    },
  ],
  catalogue: [
    {
      titleKey: 'menu.catalogue.group.products',
      children: [
        { titleKey: 'menu.catalogue.products', path: '/catalogue/products' },
        {
          titleKey: 'menu.catalogue.hotels',
          path: '/catalogue/hotels',
          badgeKey: 'badge.new',
        },
        { titleKey: 'menu.catalogue.flights', path: '/catalogue/flights' },
        { titleKey: 'menu.catalogue.transfers', path: '/catalogue/transfers' },
      ],
    },
    {
      titleKey: 'menu.catalogue.group.organization',
      children: [
        {
          titleKey: 'menu.catalogue.destinations',
          path: '/catalogue/destinations',
        },
        { titleKey: 'menu.catalogue.suppliers', path: '/catalogue/suppliers' },
      ],
    },
  ],
  pricing: [
    {
      titleKey: 'menu.pricing.group.rates',
      children: [
        { titleKey: 'menu.pricing.grids', path: '/pricing/grids' },
        { titleKey: 'menu.pricing.margins', path: '/pricing/margins' },
        { titleKey: 'menu.pricing.promotions', path: '/pricing/promotions' },
      ],
    },
    {
      titleKey: 'menu.pricing.group.rules',
      children: [
        { titleKey: 'menu.pricing.scales', path: '/pricing/scales' },
        { titleKey: 'menu.pricing.seasons', path: '/pricing/seasons' },
      ],
    },
  ],
  settings: [
    {
      titleKey: 'menu.settings.group.organization',
      children: [
        { titleKey: 'menu.settings.offices', path: '/settings/offices' },
        {
          titleKey: 'menu.settings.users',
          path: '/settings/users',
          permission: 'core.user.view',
        },
        {
          titleKey: 'menu.settings.roles',
          path: '/settings/roles',
          permission: 'core.role.view',
        },
      ],
    },
    {
      titleKey: 'menu.settings.group.system',
      children: [
        { titleKey: 'menu.settings.currencies', path: '/settings/currencies' },
        { titleKey: 'menu.settings.general', path: '/settings/general' },
        { titleKey: 'menu.settings.audit', path: '/settings/audit' },
      ],
    },
  ],
}
