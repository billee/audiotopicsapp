import { BackgroundConfig, BackgroundContext, BackgroundImageMetadata } from '../types/backgroundImage';
import {
    backgroundAssets,
    getRemoteUrlByContext,
    getLocalAssetByContext,
    getRandomAmbientBackground,
    hasCategoryBackground,
    getAvailableCategoryIds
} from '../assets/backgrounds';

/**
 * Validates if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Generates a fallback color based on context
 */
export const getFallbackColor = (context: BackgroundContext): string => {
    switch (context.type) {
        case 'category-screen':
            return '#1a1a1a';
        case 'topic-list':
            // Generate color based on category
            return getCategoryColor(context.categoryId);
        case 'audio-player':
            return '#0f0f0f';
        default:
            return '#1a1a1a';
    }
};

/**
 * Maps numeric category IDs to category names for background selection
 */
export const mapCategoryIdToName = (categoryId: string): string => {
    const categoryMapping: { [key: string]: string } = {
        '1': 'technology',
        '2': 'science',
        '3': 'history',
        '4': 'arts',
        '5': 'business',
        '6': 'health',
    };

    return categoryMapping[categoryId] || 'default';
};

/**
 * Gets a category-specific color
 */
export const getCategoryColor = (categoryId: string): string => {
    // Map numeric ID to category name first
    const categoryName = mapCategoryIdToName(categoryId);

    const categoryColors: { [key: string]: string } = {
        technology: '#1e3a8a',
        science: '#065f46',
        history: '#7c2d12',
        business: '#581c87',
        health: '#be123c',
        arts: '#a21caf',
        default: '#1a1a1a',
    };

    return categoryColors[categoryName] || categoryColors.default;
};

/**
 * Generates overlay colors based on image brightness
 */
export const getOverlayColors = (isDarkImage: boolean = false): string[] => {
    if (isDarkImage) {
        return ['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.3)'];
    }
    return ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)'];
};

/**
 * Calculates optimal overlay opacity based on context
 */
export const getOptimalOverlayOpacity = (context: BackgroundContext): number => {
    switch (context.type) {
        case 'category-screen':
            return 0.4; // Medium overlay for category cards readability
        case 'topic-list':
            // Adjust opacity based on category for optimal readability
            const categoryName = mapCategoryIdToName(context.categoryId);
            const categoryOpacities: { [key: string]: number } = {
                technology: 0.5, // Tech backgrounds may be brighter
                science: 0.45,   // Science backgrounds often have good contrast
                history: 0.55,   // Historical images may need more overlay
                business: 0.5,   // Business backgrounds are usually professional
                health: 0.45,    // Health images often have good natural contrast
                arts: 0.6,       // Arts backgrounds can be very colorful/busy
                default: 0.5,
            };
            return categoryOpacities[categoryName] || categoryOpacities.default;
        case 'audio-player':
            return 0.3; // Lower overlay for ambient feel
        default:
            return 0.4;
    }
};

/**
 * Creates a background configuration with validation using asset organization
 */
export const createBackgroundConfig = (
    partialConfig: Partial<BackgroundConfig>
): BackgroundConfig => {
    const defaultConfig: BackgroundConfig = {
        categoryScreen: {
            default: backgroundAssets.categoryScreen.default.remote,
            fallback: backgroundAssets.categoryScreen.fallback.remote,
        },
        topicList: {
            technology: backgroundAssets.topicList.technology.remote,
            science: backgroundAssets.topicList.science.remote,
            history: backgroundAssets.topicList.history.remote,
            business: backgroundAssets.topicList.business.remote,
            health: backgroundAssets.topicList.health.remote,
            arts: backgroundAssets.topicList.arts.remote,
            default: backgroundAssets.topicList.default.remote,
        },
        audioPlayer: {
            default: backgroundAssets.audioPlayer.default.remote,
            ambient: backgroundAssets.audioPlayer.ambient.map(bg => bg.remote),
        },
    };

    return {
        categoryScreen: {
            ...defaultConfig.categoryScreen,
            ...partialConfig.categoryScreen,
        },
        topicList: {
            ...defaultConfig.topicList,
            ...partialConfig.topicList,
        },
        audioPlayer: {
            ...defaultConfig.audioPlayer,
            ...partialConfig.audioPlayer,
        },
    };
};

/**
 * Validates a background configuration
 */
export const validateBackgroundConfig = (config: BackgroundConfig): boolean => {
    try {
        // Validate category screen config
        if (!config.categoryScreen?.default || !isValidImageUrl(config.categoryScreen.default)) {
            return false;
        }

        // Validate topic list config
        if (!config.topicList?.default || !isValidImageUrl(config.topicList.default)) {
            return false;
        }

        // Validate audio player config
        if (!config.audioPlayer?.default || !isValidImageUrl(config.audioPlayer.default)) {
            return false;
        }

        if (!Array.isArray(config.audioPlayer.ambient) || config.audioPlayer.ambient.length === 0) {
            return false;
        }

        // Validate all ambient images
        for (const ambientUrl of config.audioPlayer.ambient) {
            if (!isValidImageUrl(ambientUrl)) {
                return false;
            }
        }

        return true;
    } catch {
        return false;
    }
};

/**
 * Creates image metadata with default values
 */
export const createImageMetadata = (
    uri: string,
    context: BackgroundContext,
    overrides: Partial<BackgroundImageMetadata> = {}
): BackgroundImageMetadata => {
    return {
        id: uri,
        uri,
        context,
        overlayRecommended: true,
        overlayOpacity: getOptimalOverlayOpacity(context),
        primaryColor: getFallbackColor(context),
        contrastRatio: 4.5,
        ...overrides,
    };
};

/**
 * Gets enhanced category-specific background mappings from assets
 */
export const getEnhancedCategoryMappings = (): { [key: string]: string } => {
    const mappings: { [key: string]: string } = {};

    // Map numeric category IDs to their background URLs
    const numericCategoryIds = ['1', '2', '3', '4', '5', '6'];

    numericCategoryIds.forEach(categoryId => {
        const categoryName = mapCategoryIdToName(categoryId);
        mappings[categoryId] = getRemoteUrlByContext('topic-list', categoryName);
    });

    // Also include category name mappings for backward compatibility
    const categoryNames = getAvailableCategoryIds();
    categoryNames.forEach(categoryName => {
        mappings[categoryName] = getRemoteUrlByContext('topic-list', categoryName);
    });

    // Add default mapping
    mappings.default = backgroundAssets.topicList.default.remote;

    return mappings;
};

/**
 * Validates image quality parameters
 */
export const validateImageQuality = (uri: string): boolean => {
    if (!isValidImageUrl(uri)) {
        return false;
    }

    try {
        const url = new URL(uri);

        // Check for minimum resolution parameters (for Unsplash URLs)
        if (url.hostname.includes('unsplash.com')) {
            const params = url.searchParams;
            const width = parseInt(params.get('w') || '0');
            const height = parseInt(params.get('h') || '0');

            // Ensure minimum quality dimensions
            return width >= 800 && height >= 600;
        }

        // For other URLs, assume they are valid if they pass basic URL validation
        return true;
    } catch {
        return false;
    }
};

/**
 * Creates a responsive image URL with appropriate dimensions
 */
export const createResponsiveImageUrl = (
    baseUri: string,
    width: number = 800,
    height: number = 600
): string => {
    if (!isValidImageUrl(baseUri)) {
        return baseUri;
    }

    try {
        const url = new URL(baseUri);

        // Handle Unsplash URLs specifically
        if (url.hostname.includes('unsplash.com')) {
            url.searchParams.set('w', width.toString());
            url.searchParams.set('h', height.toString());
            url.searchParams.set('fit', 'crop');
            url.searchParams.set('crop', 'center');
            return url.toString();
        }

        return baseUri;
    } catch {
        return baseUri;
    }
};

/**
 * Generates optimized image URLs for different screen densities
 */
export const generateResponsiveImageUrls = (baseUri: string): {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
} => {
    return {
        small: createResponsiveImageUrl(baseUri, 400, 300),
        medium: createResponsiveImageUrl(baseUri, 800, 600),
        large: createResponsiveImageUrl(baseUri, 1200, 900),
        xlarge: createResponsiveImageUrl(baseUri, 1600, 1200),
    };
};

/**
 * Gets the appropriate image size based on screen dimensions
 */
export const getOptimalImageSize = (screenWidth: number, screenHeight: number): 'small' | 'medium' | 'large' | 'xlarge' => {
    const screenArea = screenWidth * screenHeight;

    if (screenArea < 400 * 300) return 'small';
    if (screenArea < 800 * 600) return 'medium';
    if (screenArea < 1200 * 900) return 'large';
    return 'xlarge';
};

/**
 * Validates image dimensions for quality assurance
 */
export const validateImageDimensions = (width: number, height: number): boolean => {
    // Minimum dimensions for quality backgrounds
    const minWidth = 800;
    const minHeight = 600;

    // Maximum dimensions to prevent excessive memory usage
    const maxWidth = 2400;
    const maxHeight = 1800;

    return width >= minWidth && height >= minHeight && width <= maxWidth && height <= maxHeight;
};

/**
 * Generates image metadata for caching and optimization
 */
export const generateImageMetadata = (
    uri: string,
    context: BackgroundContext,
    dimensions?: { width: number; height: number }
): BackgroundImageMetadata => {
    const metadata = createImageMetadata(uri, context);

    if (dimensions && validateImageDimensions(dimensions.width, dimensions.height)) {
        // Add dimension-specific optimizations
        metadata.overlayOpacity = getOptimalOverlayOpacity(context);
    }

    return metadata;
};

/**
 * Gets ambient background images for audio player from assets
 */
export const getAmbientBackgrounds = (): string[] => {
    return backgroundAssets.audioPlayer.ambient.map(bg => bg.remote);
};

/**
 * Gets a random ambient background image
 */
export const getRandomAmbientBackgroundUrl = (): string => {
    const randomBg = getRandomAmbientBackground();
    return randomBg.remote;
};

/**
 * Gets local asset path for a given context and category
 */
export const getLocalBackgroundAsset = (context: BackgroundContext): any => {
    switch (context.type) {
        case 'category-screen':
            return getLocalAssetByContext('category-screen');
        case 'topic-list':
            const categoryName = mapCategoryIdToName(context.categoryId);
            return getLocalAssetByContext('topic-list', categoryName);
        case 'audio-player':
            return getLocalAssetByContext('audio-player');
        default:
            return getLocalAssetByContext('category-screen');
    }
};

/**
 * Gets remote URL for a given context and category
 */
export const getRemoteBackgroundUrl = (context: BackgroundContext): string => {
    switch (context.type) {
        case 'category-screen':
            return getRemoteUrlByContext('category-screen');
        case 'topic-list':
            const categoryName = mapCategoryIdToName(context.categoryId);
            return getRemoteUrlByContext('topic-list', categoryName);
        case 'audio-player':
            return getRemoteUrlByContext('audio-player');
        default:
            return getRemoteUrlByContext('category-screen');
    }
};

/**
 * Checks if a specific category has a dedicated background image
 */
export const categoryHasBackground = (categoryId: string): boolean => {
    // Handle both numeric IDs and category names
    const categoryName = /^\d+$/.test(categoryId) ? mapCategoryIdToName(categoryId) : categoryId;
    return hasCategoryBackground(categoryName);
};

/**
 * Gets all available category backgrounds
 */
export const getAllCategoryBackgrounds = (): { [key: string]: { remote: string; local: any; description: string } } => {
    return backgroundAssets.topicList;
};

/**
 * Gets background image with fallback support
 */
export const getBackgroundWithFallback = (context: BackgroundContext, preferLocal: boolean = false): string | any => {
    try {
        if (preferLocal) {
            return getLocalBackgroundAsset(context);
        } else {
            return getRemoteBackgroundUrl(context);
        }
    } catch (error) {
        // Return fallback
        if (preferLocal) {
            return backgroundAssets.categoryScreen.fallback.local;
        } else {
            return backgroundAssets.categoryScreen.fallback.remote;
        }
    }
};