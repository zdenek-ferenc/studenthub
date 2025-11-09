import { MetadataRoute } from 'next'

const baseUrl = 'https://www.risehigh.io'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    const staticRoutes = [
        '/',
        '/zasady-ochrany-udaju',
    ];

    const staticUrls = staticRoutes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const, 
        priority: route === '/' ? 1.0 : 0.5,
    }));

    return [
        ...staticUrls,
    ];
}