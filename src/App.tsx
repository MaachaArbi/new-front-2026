import { useState } from 'react'
import { I18nProvider, useI18n } from './app/providers/i18n-provider'
import { ThemeProvider, useTheme } from './app/providers/theme-provider'
import { MODULES, OFFICES, CURRENT_USER } from './shared/dev/mock-modules'
import { LANGUAGES } from './shared/i18n/config'
import { Sun, Moon, Plus } from 'lucide-react'

function AppLayout() {
  const { currentLanguage, setLanguage, t } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const [currentModule, setCurrentModule] = useState('parties')

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950">
      {/* Rail */}
      <div className="flex w-20 flex-col items-center justify-between bg-slate-100 py-6 dark:bg-slate-900">
        <div className="flex flex-col gap-4">
          {MODULES.map((module) => {
            const Icon = module.icon
            const isActive = currentModule === module.id
            return (
              <button
                key={module.id}
                onClick={() => setCurrentModule(module.id)}
                title={t(module.key)}
                className={`rounded-lg p-3 transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-6 w-6" />
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3">
          <button
            title={t('layout.addModule')}
            className="rounded-lg p-3 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Plus className="h-6 w-6" />
          </button>
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            className="rounded-lg p-3 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === 'light' ? (
              <Moon className="h-6 w-6" />
            ) : (
              <Sun className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-slate-50 dark:bg-slate-900">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <select className="w-full rounded bg-white px-3 py-2 text-sm dark:bg-slate-800">
              {OFFICES.map((office) => (
                <option key={office.id}>{office.name}</option>
              ))}
            </select>
            <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              {t(MODULES.find((m) => m.id === currentModule)?.key || '')}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <a
                  key={i}
                  href="#"
                  className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Menu Item {i}
                </a>
              ))}
            </div>
          </nav>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {CURRENT_USER.name}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {CURRENT_USER.email}
                </div>
              </div>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) =>
                setLanguage(e.target.value as 'en' | 'fr' | 'ar')
              }
              className="w-full rounded bg-white px-3 py-1 text-sm dark:bg-slate-800"
            >
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            OsTravel Back Office
          </h1>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-6 dark:bg-slate-950">
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                Welcome to OsTravel
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Select a module from the rail to get started. Toggle theme and
                language below.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-white p-4 shadow dark:bg-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Light/Dark Mode
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Toggle in the rail footer
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow dark:bg-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Multilingual (RTL Ready)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Switch languages in sidebar footer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppLayout />
      </I18nProvider>
    </ThemeProvider>
  )
}
