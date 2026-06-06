module.exports = {
  env: {
    node: true,
    es2024: true,
    jest: true,
  },
  globals: {
    vi: 'readonly',
  },
  extends: [
    'eslint:recommended',
    'prettier' // This MUST be last. It disables formatting rules that conflict with Prettier.
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-unused-vars': 'warn', // Better to warn than ignore entirely
    'no-console': 'off', // Consoles are fine for backend servers
  },
};
