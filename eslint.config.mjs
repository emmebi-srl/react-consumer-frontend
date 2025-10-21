import eslint from '@eslint/js';
import jsxa11y from 'eslint-plugin-jsx-a11y';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import tseslint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist'

export default tseslint.config(
  {
    extends: [eslint.configs.recommended],
    rules: {
      'no-case-declarations': 'off',
      'object-shorthand': ['error', 'always'],
      'eol-last': 'error',
    },
  },
  {
    extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
    },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  },
  {
    files: ['scripts/**/*.ts', 'src/**/*.ts', 'src/**/*.tsx'],
    extends: [reactRecommended],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxa11y,
    },
    rules: {
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['scripts/**/*.ts', 'src/**/*.ts', 'src/**/*.tsx'],
    ignores: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    rules: {
      'no-console': ['error', { allow: ['error'] }],
    },
  },
  {
    files: ['scripts/**/*.ts', 'src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      import: { rules: pluginImport.rules },
    },
    rules: {
      'import/no-unresolved': 'error',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    extends: [prettierRecommended],
  },
  {
    files: ['src/services/analytics.ts'],
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-enums': 'error',
    },
  }
);
