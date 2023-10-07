/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['@typescript-eslint', 'require-explicit-generics'],
  root: true,
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'require-explicit-generics/require-explicit-generics': [
      'error',
      [ 'useParams', 'useRef', 'useState', 'axios.get' ]
    ]
  }
};
