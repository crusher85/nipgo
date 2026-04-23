import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/firma/', '/search', '/cennik', '/'],
        disallow: ['/dashboard/', '/api/', '/login', '/rejestracja'],
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Bytespider'],
        disallow: ['/'],
      },
    ],
    sitemap: 'https://nipgo.pl/sitemap/0.xml',
    host: 'https://nipgo.pl',
  }
}
