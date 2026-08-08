import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/app/providers/auth-provider'
import { useI18n } from '@/app/providers/i18n-provider'
import { ApiError } from '@/shared/api/errors'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'

/**
 * Écran de connexion. Un échec est **générique** (le 401 est indistinct côté API,
 * contrat §1.2) — jamais « e-mail inconnu » vs « mot de passe faux ». Accessible
 * (libellés associés, `aria-invalid`, `role="alert"`), sans classe directionnelle
 * physique. Le refresh token est posé par le serveur en cookie ; on ne stocke rien.
 */

interface LoginForm {
  email: string
  password: string
}

/**
 * Comptes du jeu de démonstration — **affichés en DEV uniquement** (`import.meta.env.DEV`),
 * jamais dans un build de production : on n'expose pas d'identifiants sur un écran public.
 * Un clic pré-remplit et connecte. Le mot de passe est commun au jeu de démo.
 */
const DEMO_PASSWORD = 'Demo-2026-OsTravel'
const DEMO_ACCOUNTS: readonly {
  email: string
  role: string
  office: string
}[] = [
  {
    email: 'salma.ben.amor@demo.ostravel.tn',
    role: 'Agent de réservation',
    office: 'Tunis',
  },
  {
    email: 'mehdi.trabelsi@demo.ostravel.tn',
    role: 'Responsable',
    office: 'Tunis',
  },
  {
    email: 'yasmine.gharbi@demo.ostravel.tn',
    role: 'Finance',
    office: 'Tunis',
  },
  { email: 'karim.belhadj@demo.ostravel.tn', role: 'Agent', office: 'Alger' },
  { email: 'claire.moreau@demo.ostravel.tn', role: 'Agent', office: 'Paris' },
]

export function LoginPage() {
  const { t } = useI18n()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { email: '', password: '' } })
  const [errorKind, setErrorKind] = React.useState<
    'credentials' | 'network' | null
  >(null)

  const attemptLogin = React.useCallback(
    async (email: string, password: string) => {
      setErrorKind(null)
      try {
        await login(email, password)
      } catch (error) {
        // 401 = mauvais identifiants ; tout le reste (réseau, CORS, serveur
        // injoignable) = un message DISTINCT, pour ne pas accuser à tort le mot
        // de passe (le back nous avait prévenus : origine/tunnel ≠ 401).
        if (error instanceof ApiError && error.isUnauthorized) {
          setErrorKind('credentials')
        } else {
          setErrorKind('network')
          console.error('Échec de connexion :', error)
        }
      }
    },
    [login]
  )

  const onSubmit = handleSubmit((values) =>
    attemptLogin(values.email, values.password)
  )

  // DEV : pré-remplit les champs (visibles) puis connecte, en un clic.
  const signInAsDemo = (email: string) => {
    setValue('email', email)
    setValue('password', DEMO_PASSWORD)
    void attemptLogin(email, DEMO_PASSWORD)
  }

  const errorId = 'login-error'
  const errorMessage =
    errorKind === 'credentials'
      ? t('login.error')
      : errorKind === 'network'
        ? t('login.networkError')
        : null

  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-6">
      <div className="border-border bg-card w-full max-w-sm rounded-xl border p-6 shadow-sm">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="text-foreground text-xl font-semibold">
            {t('login.title')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('login.subtitle')}</p>
        </header>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-foreground text-sm font-medium"
            >
              {t('login.email')}
            </label>
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              dir="ltr"
              aria-invalid={errors.email ? true : undefined}
              {...register('email', { required: true })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-foreground text-sm font-medium"
            >
              {t('login.password')}
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errorMessage ? errorId : undefined}
              {...register('password', { required: true })}
            />
          </div>

          {errorMessage ? (
            <p id={errorId} role="alert" className="text-destructive text-sm">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>

        {import.meta.env.DEV ? (
          <div className="border-border mt-6 border-t pt-4">
            <p className="text-muted-foreground mb-2 text-xs">
              Comptes de démo · <span className="font-medium">dev</span> — un
              clic connecte. Mot de passe&nbsp;:{' '}
              <span dir="ltr" className="font-mono">
                {DEMO_PASSWORD}
              </span>
            </p>
            <ul className="flex flex-col gap-0.5">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.email}>
                  <button
                    type="button"
                    onClick={() => signInAsDemo(account.email)}
                    disabled={isSubmitting}
                    className="hover:bg-accent flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-start text-xs disabled:opacity-60"
                  >
                    <span dir="ltr" className="truncate font-mono">
                      {account.email}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {account.role} · {account.office}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
