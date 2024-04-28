import vercelPrettierOptions from '@vercel/style-guide/prettier';

/** @type {import('prettier').Config} */
const config = {
  ...vercelPrettierOptions,
  plugins: [
    'prettier-plugin-tailwindcss',
    'prettier-plugin-prisma',
    ...vercelPrettierOptions.plugins,
  ],
};

export default config;
