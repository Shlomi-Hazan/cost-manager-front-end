import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/*
 * Project lint configuration, run in CI on every Pull Request (see
 * .github/workflows/ci.yml). react-hooks rules catch incorrect hook usage
 * (missing dependencies, hooks called conditionally); react-refresh's rule
 * is set to a warning (not an error) since a few files intentionally
 * export a constant alongside a component.
 */
export default [
  {
    ignores: ['dist', 'coverage', 'submission']
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      // Course style-guide alignment (Professional JavaScript Style Guide):
      // no var, strict equality, prefer const, single-quoted JS strings
      // (JSX attributes stay double-quoted, the universal convention), and
      // explicit semicolons.
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'prefer-const': 'error',
      'quotes': ['error', 'single', { avoidEscape: true }],
      'jsx-quotes': ['error', 'prefer-double'],
      'semi': ['error', 'always']
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
