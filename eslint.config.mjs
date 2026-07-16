import { inherits } from 'util';
import nextjs from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginPrettier from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.next/',
      'out/',
      'build/',
      'next-env.d.ts',
      'node_modules/',
      '.git/',
      '.husky/',
    ],
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextjs,
      prettier: pluginPrettier,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...nextjs.configs.recommended.rules,
      ...nextjs.configs['core-web-vitals'].rules,
      ...pluginPrettierRecommended.rules,
      ...eslintConfigPrettier.rules,
    },
  },
];
