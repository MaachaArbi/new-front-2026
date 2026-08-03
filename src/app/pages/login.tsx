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

export function LoginPage() {
  const { t } = useI18n()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { email: '', password: '' } })
  const [errorKind, setErrorKind] = React.useState<
    'credentials' | 'network' | null
  >(null)

  const onSubmit = handleSubmit(async (values) => {
    setErrorKind(null)
    try {
      await login(values.email, values.password)
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
  })

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
      </div>
    </div>
  )
}
