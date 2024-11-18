module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  plugins: ['prettier-plugin-tailwindcss', '@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^react', '^next', '^[a-zA-Z]', '^@?\\w', '^@/?\\w', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
