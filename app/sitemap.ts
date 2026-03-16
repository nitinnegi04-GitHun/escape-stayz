import { MetadataRoute } from 'next'
import { getHotels, getDestinations, getBlogPosts } from '../lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://escapestayz.com'

    // Fetch all slugs for dynamic pages
    const [hotels, destinations, posts] = await Promise.all([
        getHotels(100),
        getDestinations(),
        getBlogPosts(),
    ])

    const hotelUrls = hotels.map((hotel) => ({
        url: `${baseUrl}/hotels/${hotel.slug}`,
        lastModified: new Date(hotel.updated_at || hotel.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const destinationUrls = destinations.map((dest) => ({
        url: `${baseUrl}/destinations/${dest.slug}`,
        lastModified: new Date(dest.updated_at || dest.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    const postUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/hotels`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/destinations`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...hotelUrls,
        ...destinationUrls,
        ...postUrls,
    ]
}
