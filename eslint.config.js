import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/*
 * Project lint configuration, run in CI on every Pull Request (see
 * .github/workflows/ci.yml). react-hooks rules catch incorrect hook usage
 * (missing dependencies, hooks called conditionally); react-refresh's rule
 * is set to a warning (not an error) since a few files intentionally
 * export a constant alongside a component.
 */
export default [
  {
    ignores: ["dist", "coverage"]
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        sourceType: "module"
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }
      ]
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];
