export function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
          OsTravel Back Office
        </h1>
        <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
          Squelette S1 — Vite 7 + React 19 + TypeScript strict
        </p>
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-slate-800">
          <p className="mb-4 text-slate-700 dark:text-slate-300">
            Édifice stable, prêt pour la phase S2 (tokens & thème).
          </p>
          <code className="block rounded bg-slate-100 p-3 text-sm text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            npm run dev → 5180
          </code>
        </div>
      </div>
    </div>
  )
}
