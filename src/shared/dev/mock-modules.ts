import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Settings,
  Clock,
} from 'lucide-react'

export const MODULES = [
  {
    id: 'parties',
    key: 'nav.module.parties',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    id: 'bookings',
    key: 'nav.module.bookings',
    icon: Calendar,
    color: 'bg-purple-500',
  },
  {
    id: 'settlements',
    key: 'nav.module.settlements',
    icon: FileText,
    color: 'bg-green-500',
  },
  {
    id: 'cash',
    key: 'nav.module.cash',
    icon: DollarSign,
    color: 'bg-orange-500',
  },
  {
    id: 'invoicing',
    key: 'nav.module.invoicing',
    icon: ShoppingCart,
    color: 'bg-red-500',
  },
  {
    id: 'catalogue',
    key: 'nav.module.catalogue',
    icon: BarChart3,
    color: 'bg-indigo-500',
  },
  {
    id: 'pricing',
    key: 'nav.module.pricing',
    icon: Clock,
    color: 'bg-pink-500',
  },
  {
    id: 'settings',
    key: 'nav.module.settings',
    icon: Settings,
    color: 'bg-slate-500',
  },
]

export const OFFICES = [
  { id: '1', name: 'Bureau Tunisie' },
  { id: '2', name: 'Bureau Algérie' },
  { id: '3', name: 'Bureau France' },
]

export const CURRENT_USER = {
  id: '1',
  name: 'Ahmed Ben Ali',
  email: 'ahmed@example.com',
}
