/**
 * MENU UTILISATEUR — **prélevé tel quel** de
 * `vendor-metronic/starter-kit/src/components/layouts/layout-1/shared/topbar/user-dropdown-menu.tsx`.
 *
 * Décision d'Arbi : on prend celui de layout-1 à l'identique, contenu compris, y
 * compris le mode sombre et le sélecteur de langue — **en statique pour l'instant**.
 * Le contenu (Sean, sean@kt.com, Pro, Public Profile…) est celui du template ; il
 * sera remplacé par le nôtre quand l'écran du compte existera.
 *
 * Adaptations, et elles seules : chemins d'import, `react-router` → `react-router-dom`,
 * et `toAbsoluteUrl()` retiré (nos médias sont servis depuis `public/`).
 *
 * Deux adaptations FORCÉES par notre configuration, notées ici pour qu'on sache
 * qu'elles ne sont pas des choix :
 *  · `IdCard` n'existe pas dans notre version de lucide (0.408) → `ContactRound` ;
 *  · l'accès `I18N_LANGUAGES[0]` doit être affirmé — `noUncheckedIndexedAccess`
 *    est non négociable (ADR-F05), et `!` est interdit par le lint ;
 *
 * ⚠️ Le seul élément VIVANT est la bascule de thème : elle passe par `next-themes`,
 * comme dans le template. La langue est affichée mais n'agit pas encore.
 */
import { ReactNode } from 'react'
import {
  BetweenHorizontalStart,
  Coffee,
  CreditCard,
  FileText,
  Globe,
  ContactRound,
  Moon,
  Settings,
  Shield,
  SquareCode,
  UserCircle,
  Users,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link } from 'react-router-dom'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Switch } from '@/shared/ui/switch'

const I18N_LANGUAGES = [
  {
    label: 'English',
    code: 'en',
    direction: 'ltr',
    flag: '/media/flags/united-states.svg',
  },
  {
    label: 'Arabic (Saudi)',
    code: 'ar',
    direction: 'rtl',
    flag: '/media/flags/saudi-arabia.svg',
  },
  {
    label: 'French',
    code: 'fr',
    direction: 'ltr',
    flag: '/media/flags/france.svg',
  },
  {
    label: 'Chinese',
    code: 'zh',
    direction: 'ltr',
    flag: '/media/flags/china.svg',
  },
]

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  // `noUncheckedIndexedAccess` (ADR-F05) : un accès par index peut valoir `undefined`,
  // et l'affirmation `!` est refusée par le lint. On nomme donc le défaut.
  const currenLanguage = I18N_LANGUAGES[0] ?? {
    label: 'English',
    code: 'en',
    direction: 'ltr',
    flag: '/media/flags/united-states.svg',
  }
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <img
              className="size-9 rounded-full border-2 border-green-500"
              src={'/media/avatars/300-2.png'}
              alt="User avatar"
            />
            <div className="flex flex-col">
              <Link
                to="#"
                className="text-mono hover:text-primary text-sm font-semibold"
              >
                Sean
              </Link>
              <a
                href={`mailto:sean@kt.com`}
                className="text-muted-foreground hover:text-primary text-xs"
              >
                sean@kt.com
              </a>
            </div>
          </div>
          <Badge variant="primary" appearance="light" size="sm">
            Pro
          </Badge>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link to="#" className="flex items-center gap-2">
            <ContactRound />
            Public Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="#" className="flex items-center gap-2">
            <UserCircle />
            My Profile
          </Link>
        </DropdownMenuItem>

        {/* My Account Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Settings />
            My Account
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2">
                <Coffee />
                Get Started
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2">
                <FileText />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2">
                <CreditCard />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2">
                <Shield />
                Security
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2">
                <Users />
                Members & Roles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2">
                <BetweenHorizontalStart />
                Integrations
              </Link>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild>
          <Link
            to="https://devs.keenthemes.com"
            className="flex items-center gap-2"
          >
            <SquareCode />
            Dev Forum
          </Link>
        </DropdownMenuItem>

        {/* Language Submenu with Radio Group */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="hover:[&_[data-slot=badge]]:border-input data-[state=open]:[&_[data-slot=badge]]:border-input flex items-center gap-2 [&_[data-slot=dropdown-menu-sub-trigger-indicator]]:hidden">
            <Globe />
            <span className="relative flex grow items-center justify-between gap-2">
              Language
              <Badge
                variant="outline"
                className="absolute end-0 top-1/2 -translate-y-1/2"
              >
                {currenLanguage.label}
                <img
                  src={currenLanguage.flag}
                  className="h-3.5 w-3.5 rounded-full"
                  alt={currenLanguage.label}
                />
              </Badge>
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup value={currenLanguage.code}>
              {I18N_LANGUAGES.map((item) => (
                <DropdownMenuRadioItem
                  key={item.code}
                  value={item.code}
                  className="flex items-center gap-2"
                >
                  <img
                    src={item.flag}
                    className="h-4 w-4 rounded-full"
                    alt={item.label}
                  />
                  <span>{item.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Footer */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex grow items-center justify-between gap-2">
            Dark Mode
            <Switch
              size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>
        <div className="mt-1 p-2">
          <Button variant="outline" size="sm" className="w-full">
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
