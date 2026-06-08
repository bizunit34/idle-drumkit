const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

const restrictedLiteralPattern = [
  'ca-app-' + 'pub-',
  'adm' + 'ob',
  'api[_-]?' + 'key',
  'sec' + 'ret',
  'tok' + 'en',
].join('|');
const restrictedLiteralRules = [
  {
    selector: `Literal[value=/${restrictedLiteralPattern}/i]`,
    message: 'Do not hardcode credentials, real advertising identifiers, or access keys.',
  },
  {
    selector: `TemplateElement[value.raw=/${restrictedLiteralPattern}/i]`,
    message: 'Do not hardcode credentials, real advertising identifiers, or access keys.',
  },
];

module.exports = defineConfig([
  ...expoConfig,
  prettierConfig,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'ios/**',
      'android/**',
      'assets/**/*.png',
      'assets/**/*.ico',
      'assets/**/*.wav',
      'package-lock.json',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': ['error', ...restrictedLiteralRules],
    },
  },
  {
    files: ['**/*.{js,cjs,mjs}', 'scripts/**/*.{js,cjs,mjs}'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': ['error', ...restrictedLiteralRules],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
]);
