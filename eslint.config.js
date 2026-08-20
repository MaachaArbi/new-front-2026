import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'

// Règle RTL (ADR-F04) : interdit les classes directionnelles PHYSIQUES dans les
// chaînes (className), en propriétés logiques obligatoires. Conçue pour mordre
// sur les vraies fuites (ml-4, text-left, border-l, space-x-, rounded-l…) sans
// faux positifs : `rounded-lg`, `border-ring`, `slide-in-from-left-2` et
// `inset-x-0` (exception autorisée) ne déclenchent pas.
// Exceptions symétriques (left-[50%]+translate, inset-x-0) : à commenter avec
// un eslint-disable-next-line ponctuel si nécessaire.
const RTL_PHYSICAL = String.raw`(^|[\s:])(p[lr]-[\w[]|m[lr]-[\w[]|(left|right)-[\d[]|border-[lr](?![a-z])|rounded-(tl|tr|bl|br|[lr])(?![a-z])|text-(left|right)(?![a-z])|space-x-|inset-x-(?!0))`

const rtlMessage =
  'Classe directionnelle physique interdite (ADR-F04). Utilise la propriété logique : ps-/pe-, ms-/me-, start-/end-, border-s/border-e, rounded-s/rounded-e, text-start/text-end, gap-x-.'

const rtlSelectors = [
  { selector: `Literal[value=/${RTL_PHYSICAL}/]`, message: rtlMessage },
  {
    selector: `TemplateElement[value.raw=/${RTL_PHYSICAL}/]`,
    message: rtlMessage,
  },
]

// Règle COULEUR : interdit les couleurs LITTÉRALES dans les chaînes de classes.
// Motif : le système de design ne vaut que si un changement de palette se propage
// SEUL. Une seule `bg-white` ou `border-green-500` oubliée dans un composant, et
// ce composant ne suivra jamais un restylage — sans que rien ne le signale. La
// règle transforme la convention en garantie vérifiée par le build.
//
// Passent : nos jetons (`bg-primary`, `text-ink-muted`, `bg-fill-danger`), les
// mots-clés CSS (`transparent`, `current`, `inherit`), et `var(--…)`.
// Mordent : les noms de la palette Tailwind, les hexadécimaux, `rgb()` en dur.
const TW_PALETTE =
  'white|black|zinc|slate|gray|stone|neutral|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const COLOR_UTIL =
  'bg|text|border|ring|fill|stroke|from|via|to|decoration|outline|divide|accent|caret|shadow|placeholder'
const COLOR_LITERAL = String.raw`(^|[\s:'"\`])(${COLOR_UTIL})-(${TW_PALETTE})(-\d{2,3})?(\/\d{1,3})?(?![\w-])|(${COLOR_UTIL})-\[#[0-9a-fA-F]{3,8}\]|(${COLOR_UTIL})-\[rgb`

const colorMessage =
  "Couleur littérale interdite. Le système de design ne se propage que si TOUTE couleur passe par un jeton : utilise bg-primary, text-ink-muted, bg-fill-danger… et définis le jeton manquant dans src/styles/tokens.css plutôt que d'écrire la couleur ici."

const colorSelectors = [
  { selector: `Literal[value=/${COLOR_LITERAL}/]`, message: colorMessage },
  {
    selector: `TemplateElement[value.raw=/${COLOR_LITERAL}/]`,
    message: colorMessage,
  },
]

// Règle Money (ADR-F07) : rend l'interdit inviolable. `toFixed` code en dur le
// nombre de décimales — faux d'un facteur 10 sur les devises à 3 décimales ;
// et diviser/multiplier un montant par 100/1000 en clair court-circuite le
// noyau Money. Approximation assumée par nom de variable évoquant un montant :
// « un faux positif vaut mieux qu'un montant faux ». Le noyau `src/shared/money/`
// est l'exception (ces opérations y sont légitimes et testées) — voir plus bas.
const NAME = 'amount|montant|total|price|prix|solde|balance'
const factorMessage =
  'Montant multiplié/divisé par 100 ou 1000 en clair (ADR-F07). Passe par le noyau Money (src/shared/money) : minor_unit vient de la devise, jamais codé en dur.'
const toFixedMessage =
  'toFixed interdit (ADR-F07) : décimales codées en dur, faux d’un facteur 10 sur les devises à 3 décimales. Utilise Money.format().'

const moneySelectors = [
  {
    selector: "CallExpression[callee.property.name='toFixed']",
    message: toFixedMessage,
  },
  {
    selector: `BinaryExpression[operator='/'][right.value=/^(100|1000)$/][left.name=/${NAME}/i]`,
    message: factorMessage,
  },
  {
    selector: `BinaryExpression[operator='*'][right.value=/^(100|1000)$/][left.name=/${NAME}/i]`,
    message: factorMessage,
  },
  {
    selector: `BinaryExpression[operator='/'][right.value=/^(100|1000)$/][left.property.name=/${NAME}/i]`,
    message: factorMessage,
  },
  {
    selector: `BinaryExpression[operator='*'][right.value=/^(100|1000)$/][left.property.name=/${NAME}/i]`,
    message: factorMessage,
  },
]

export default tseslint.config(
  {
    ignores: [
      'dist',
      'reference/**',
      'node_modules',
      'e2e/**',
      'playwright.config.ts',
    ],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strict,
      eslintConfigPrettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'prettier/prettier': 'error',
      'no-restricted-syntax': [
        'error',
        ...rtlSelectors,
        ...moneySelectors,
        ...colorSelectors,
      ],
    },
  },
  // Exception ADR-F07 : le noyau Money manipule légitimement les unités mineures.
  // On y lève UNIQUEMENT les interdits Money ; la règle RTL reste active
  // (money-input.tsx porte des classes et doit rester sans fuite directionnelle).
  {
    files: ['src/shared/money/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...rtlSelectors, ...colorSelectors],
    },
  }
)
