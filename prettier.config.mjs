import vercelPrettierOptions from '@vercel/style-guide/prettier'

/** @type {import('prettier').Config} */
const config = {
  ...vercelPrettierOptions,
  plugins: [
    ...vercelPrettierOptions.plugins,
    'prettier-plugin-prisma',
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  importOrder: [
    '^(next/(.*)$)|^(next$)', // Imports by "next"
    '^(react/(.*)$)|^(react$)', // Imports by "react"
    '^~/server/(.*)$', // Imports by "~/server"
    '<THIRD_PARTY_MODULES>', // Imports by third-party modules
    '^(.*)components/(.*)$', // Imports by "components"
    '^(.*)_util/(.*)$', // Imports by "utils"
    '^[./]', // Other imports
    '<TYPE>',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}

export default config
