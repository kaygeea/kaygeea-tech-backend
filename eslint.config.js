import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
  },
  {
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      semi: "error",
      "prefer-promise-reject-errors": "error",
      "no-throw-literal": "error",
      "no-param-reassign": "warn",
      "no-empty-function": "warn",
      // "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-else-return": "error",
      "func-names": ["error", "as-needed"],
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],
      "func-name-matching": "warn",
      "dot-notation": ["error", { allowPattern: "^[a-z]+(_[a-z]+)+$" }],
      eqeqeq: "error",
      curly: "error",
      "no-unreachable": "error",
      "no-duplicate-imports": "error",
      "prefer-const": "error",
      "no-var": "error",
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
  eslintPluginPrettierRecommended,
];
