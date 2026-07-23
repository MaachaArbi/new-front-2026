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

export default tseslint.config(
  { ignores: ['dist', 'reference/**', 'node_modules'] },
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
        { selector: `Literal[value=/${RTL_PHYSICAL}/]`, message: rtlMessage },
        {
          selector: `TemplateElement[value.raw=/${RTL_PHYSICAL}/]`,
          message: rtlMessage,
        },
      ],
    },
  }
)
