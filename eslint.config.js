import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/dist', '**/node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          // PascalCase args are JSX component params (e.g. `icon: Icon`) used only as
          // <Icon/> tags; this flat config has no eslint-plugin-react jsx-uses-vars, so
          // ignore them rather than false-flag correct code.
          argsIgnorePattern: '^[A-Z_]',
        },
      ],
      // eslint-plugin-react-hooks v7 ships new opinionated rules as errors. Keep them
      // visible as warnings (not build-blocking) until the flagged patterns are
      // deliberately refactored. react-refresh is advisory for HMR only.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/globals': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    files: ['backend/**/*.js', 'verify_setup.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // Fastify handlers routinely take (request, reply) without using both; keep the
      // server-side ignore list (the base block ignores PascalCase for JSX component args).
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^(request|reply|options|_)$',
        },
      ],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^(request|reply|options|_|context)$',
        },
      ],
    },
  },
  {
    // React-specific rules only apply to React source. Turn them off for backend,
    // Playwright/config, and scripts (e.g. a Playwright `useWithAuth` helper is not a
    // React hook, and effects/refresh rules are meaningless server-side).
    files: [
      'backend/**/*.js',
      'tests/**/*.js',
      'scripts/**/*.{js,mjs}',
      '**/*.config.{js,cjs,mjs}',
    ],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/globals': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Test files, mocks, and Node-run config/scripts use Node/test globals
    // (global, module, require, process) — not browser globals.
    files: [
      '**/*.{test,spec}.{js,jsx}',
      '**/__tests__/**/*.{js,jsx}',
      '**/__mocks__/**/*.{js,jsx}',
      'src/test/**/*.{js,jsx}',
      '**/*.config.{js,cjs,mjs}',
      'scripts/**/*.{js,mjs}',
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.vitest },
    },
  },
]);
