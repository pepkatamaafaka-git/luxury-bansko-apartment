import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://bansko-apartment.com'
  const now = new Date()

  return [
    { url: base,                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/availability`,  lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/reserve`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/apartment`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/resort-spa`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/bansko`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/gallery`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
