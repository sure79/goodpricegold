/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://goodgeumni.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    '/admin/*',
    '/dashboard/*',
    '/apply',
    '/history',
    '/reviews',
    '/settlements',
    '/tracking/*',
    '/auth/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/apply', '/history', '/reviews', '/settlements', '/tracking', '/auth'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/apply', '/history', '/reviews', '/settlements', '/tracking', '/auth'],
      },
      {
        userAgent: 'Yeti',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/apply', '/history', '/reviews', '/settlements', '/tracking', '/auth'],
      },
    ],
    additionalSitemaps: [],
  },
  transform: async (config, path) => {
    // 페이지별 우선순위 설정
    let priority = 0.7
    let changefreq = 'daily'

    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path === '/login' || path === '/signup') {
      priority = 0.8
      changefreq = 'weekly'
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    }
  },
}
