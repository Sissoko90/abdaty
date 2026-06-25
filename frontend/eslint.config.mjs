import next from 'eslint-config-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

// Flat config ESLint 9 (remplace .eslintrc.json + `next lint`, supprimés en Next 16).
// `eslint-config-next` exporte nativement un tableau flat (web-vitals + TypeScript).
// En flat config, une surcharge de règle doit déclarer son plugin dans le même objet.
const eslintConfig = [
  // Ignorés globaux (remplace .eslintignore, supprimé en ESLint 9).
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'public/**',
    ],
  },
  ...next,
  // Surcharges TypeScript (mêmes règles que l'ancienne config).
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  // Surcharge React (app FR : on tolère les apostrophes non échappées).
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: { react: reactPlugin },
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
  // Nouvelles règles react-hooks (plugin React Compiler livré avec
  // eslint-config-next 16) : signaux utiles mais introduits par l'upgrade →
  // passées en avertissement pour ne pas bloquer la CI. À résorber progressivement.
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Règles cœur ESLint (aucun plugin requis).
  {
    rules: {
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Scripts CLI et fichiers de config : console.log légitime (sortie console).
  {
    files: ['scripts/**', '*.mjs', '*.config.*'],
    rules: {
      'no-console': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
];

export default eslintConfig;
