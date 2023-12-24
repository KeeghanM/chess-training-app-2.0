const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  semi: false,
  singleQuote: true,
  importOrder: ['^components/(.*)$', '^[./]', '^[~/]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}

export default config
