module.exports = {
  env: {
    node: true,
    es2023: true
  },

  parserOptions: {
    sourceType: "module"
  },

  extends: [
    "eslint:recommended"
  ],

  rules: {
    // sem estilo
    "semi": "off",
    "quotes": "off",
    "indent": "off",
    "linebreak-style": "off",

    // erros reais
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-undef": "error",
    "no-duplicate-imports": "error",
    "no-unreachable": "error",
    "no-console": "off"
  }
}
