import { MetadataRoute } from 'next'
import { SITE_URL } from '../lib/constants'
import { getHotels, getDestinations, getBlogPosts } from '../lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all slugs for dynamic pages
    const [hotels, destinations, posts] = await Promise.all([
        getHotels(100),
        getDestinations(),
        getBlogPosts(),
    ])

    const hotelUrls = hotels.map((hotel) => ({
        url: `${SITE_URL}/hotels/${hotel.slug}`,
        lastModified: new Date(hotel.updated_at || hotel.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
    }))

    const destinationUrls = destinations.map((dest) => ({
        url: `${SITE_URL}/destinations/${dest.slug}`,
        lastModified: new Date(dest.updated_at || dest.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const postUrls = posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    return [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${SITE_URL}/hotels`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/destinations`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
        { url: `${SITE_URL}/plan-your-trip`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        ...hotelUrls,
        ...destinationUrls,
        ...postUrls,
    ]
}
