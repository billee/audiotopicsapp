/**
 * Background Image Fallback Utilities
 * 
 * Provides robust fallback mechanisms for background image loading
 */

export interface FallbackImageSource {
    uri: string;
    priority: 'primary' | 'secondary' | 'fallback';
    description: string;
}

/**
 * Creates multiple fallback sources for a given category
 */
export const createFallbackSources = (categoryId: string): FallbackImageSource[] => {
    const categoryMapping: { [key: string]: string } = {
        '1': 'technology',
        '2': 'science',
        '3': 'history',
        '4': 'arts',
        '5': 'business',
        '6': 'health',
    };

    const categoryName = categoryMapping[categoryId] || 'default';

    // Define reliable fallback URLs
    const fallbackSources: FallbackImageSource[] = [
        // Primary: Category-specific image
        {
            uri: getCategorySpecificUrl(categoryName),
            priority: 'primary',
            description: `${categoryName} category background`,
        },
        // Secondary: Generic educational background
        {
            uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
            priority: 'secondary',
            description: 'Generic educational background',
        },
        // Fallback: Simple gradient or solid color
        {
            uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMmEyYTJhO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxYTFhMWE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgLz4KPC9zdmc+',
            priority: 'fallback',
            description: 'Gradient fallback background',
        },
    ];

    return fallbackSources;
};

/**
 * Gets category-specific URL with error handling
 */
function getCategorySpecificUrl(categoryName: string): string {
    const categoryUrls: { [key: string]: string } = {
        technology: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
        science: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center', // Using working URL temporarily
        history: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
        health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
        arts: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
        default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
    };

    return categoryUrls[categoryName] || categoryUrls.default;
}

/**
 * Tests if an image URL is accessible
 */
export const testImageUrl = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

/**
 * Gets the first working image URL from fallback sources
 */
export const getWorkingImageUrl = async (categoryId: string): Promise<string> => {
    const sources = createFallbackSources(categoryId);

    for (const source of sources) {
        const isWorking = await testImageUrl(source.uri);
        if (isWorking) {
            console.log(`Using ${source.priority} image for category ${categoryId}:`, source.description);
            return source.uri;
        }
    }

    // If all else fails, return the last fallback (SVG gradient)
    return sources[sources.length - 1].uri;
};