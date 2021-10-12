module.exports = {
  env: {
    browser: true,
    es6: false,
    node: false,
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['import'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
    },
  },
  globals: {},
  rules: {
    'no-empty': 'warn',
    'no-inner-declarations': 'off',
  },
  ignorePatterns: ['dist', 'node_modules'],
};
