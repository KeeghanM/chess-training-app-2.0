/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://chesstraining.app',
  generateRobotsTxt: true,
  exclude: ['/api/*', '/_next/*', '/_error/*', '/dashboard/*'],
}
