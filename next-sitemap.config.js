/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://chesstraining.app',
  generateRobotsTxt: true,
  exclude: ['/api/*', '/_next/*', '/_error/*', '/dashboard/*'],
}

export default config
