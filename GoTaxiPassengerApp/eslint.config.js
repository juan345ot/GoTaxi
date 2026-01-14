const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        global: 'readonly',
        performance: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        clearInterval: 'readonly',
        navigator: 'readonly',
        URL: 'readonly',
        __DEV__: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'object-shorthand': 'warn',
      'prefer-template': 'warn',
      'template-curly-spacing': 'warn',
      'arrow-spacing': 'warn',
      'comma-dangle': ['warn', 'always-multiline'],
      'comma-spacing': 'warn',
      'comma-style': 'warn',
      'computed-property-spacing': 'warn',
      'func-call-spacing': 'warn',
      'key-spacing': 'warn',
      'keyword-spacing': 'warn',
      'object-curly-spacing': ['warn', 'always'],
      'semi': ['warn', 'always'],
      'semi-spacing': 'warn',
      'space-before-blocks': 'warn',
      'space-before-function-paren': ['warn', 'never'],
      'space-in-parens': 'warn',
      'space-infix-ops': 'warn',
      'space-unary-ops': 'warn',
      'spaced-comment': 'warn',
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'jsx-quotes': ['warn', 'prefer-double'],
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'warn',
      'eol-last': 'warn',
      'indent': ['warn', 2, { SwitchCase: 1 }],
      'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
      'no-mixed-spaces-and-tabs': 'warn',
      'no-tabs': 'warn',
      'array-bracket-spacing': 'warn',
      'brace-style': 'warn',
      'camelcase': ['warn', { 
        properties: 'never',
        ignoreDestructuring: true,
        allow: ['^[a-z]+(_[a-z]+)*$'] // Permitir snake_case para campos de API/BD
      }],
      'new-cap': 'warn',
      'new-parens': 'warn',
      'no-array-constructor': 'warn',
      'no-new-object': 'warn',
      'no-spaced-func': 'warn',
      'no-unneeded-ternary': 'warn',
      'one-var': ['warn', 'never'],
      'operator-assignment': 'warn',
      'operator-linebreak': ['warn', 'after'],
      'padded-blocks': ['warn', 'never'],
      'quote-props': ['warn', 'as-needed'],
      'no-control-regex': 'warn',
      'no-useless-escape': 'warn',
      'no-unreachable': 'warn',
      'no-useless-catch': 'warn',
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/translations/**/*.js', '**/api/**/*.js'],
    rules: {
      'camelcase': 'off', // Desactivar camelcase para archivos de traducción y API
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
    },
  },
  {
    files: ['**/components/**/*.js', '**/screens/**/*.js'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'react/prop-types': 'off', // Desactivar si no usas PropTypes
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off', // No necesario en React 17+
    },
  },
  {
    ignores: [
      'node_modules/',
      'android/',
      'ios/',
      '.expo/',
      'dist/',
      'build/',
      'coverage/',
      '*.min.js',
      '*.min.css',
    ],
  },
];