/** @type {import('prettier').Config} */
const config = {
    endOfLine: 'lf',
  tabWidth: 2,
  printWidth: 80,
  useTabs: false,
  singleQuote: true,
  plugins: [
    'prettier-plugin-tailwindcss',
    'prettier-plugin-prisma',
    'prettier-plugin-packagejson'
  ],
};

export default config;
