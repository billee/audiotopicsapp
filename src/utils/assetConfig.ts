/**
 * Asset Configuration for Background Images
 * 
 * This file provides centralized configuration for all background image assets,
 * including quality settings, fallback strategies, and optimization parameters.
 */

import { BackgroundConfig, BackgroundContext } from '../types/backgroundImage';
import { backgroundAssets } from '../assets/backgrounds';

/**
 * High-quality background image configuration
 */
export const HIGH_QUALITY_BACKGROUND_CONFIG: BackgroundConfig = {
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

/**
 * Local asset fallback configuration for offline support
 */
export const LOCAL_ASSET_CONFIG = {
    categoryScreen: {
        default: backgroundAssets.categoryScreen.default.local,
        fallback: backgroundAssets.categoryScreen.fallback.local,
    },
    topicList: {
        technology: backgroundAssets.topicList.technology.local,
        science: backgroundAssets.topicList.science.local,
        history: backgroundAssets.topicList.history.local,
        business: backgroundAssets.topicList.business.local,
        health: backgroundAssets.topicList.health.local,
        arts: backgroundAssets.topicList.arts.local,
        default: backgroundAssets.topicList.default.local,
    },
    audioPlayer: {
        default: backgroundAssets.audioPlayer.default.local,
        ambient: backgroundAssets.audioPlayer.ambient.map(bg => bg.local),
    },
};

/**
 * Image quality and optimization settings
 */
export const IMAGE_QUALITY_SETTINGS = {
    // Minimum dimensions for high-quality backgrounds
    minDimensions: {
        width: 800,
        height: 600,
    },
    // Maximum dimensions to prevent memory issues
    maxDimensions: {
        width: 2400,
        height: 1800,
    },
    // Responsive breakpoints
    breakpoints: {
        small: { width: 400, height: 300 },
        medium: { width: 800, height: 600 },
        large: { width: 1200, height: 900 },
        xlarge: { width: 1600, height: 1200 },
    },
    // Compression and format settings
    compression: {
        quality: 85,
        format: 'webp',
        fallbackFormat: 'jpg',
    },
};

/**
 * Context-specific overlay and contrast settings
 */
export const OVERLAY_SETTINGS = {
    categoryScreen: {
        overlayOpacity: 0.4,
        overlayColor: 'rgba(0,0,0,0.4)',
        minContrastRatio: 4.5,
    },
    topicList: {
        overlayOpacity: 0.5,
        overlayColor: 'rgba(0,0,0,0.5)',
        minContrastRatio: 4.5,
    },
    audioPlayer: {
        overlayOpacity: 0.3,
        overlayColor: 'rgba(0,0,0,0.3)',
        minContrastRatio: 3.0, // Lower for ambient feel
    },
};

/**
 * Caching and preloading configuration
 */
export const CACHE_SETTINGS = {
    // Maximum number of images to keep in cache
    maxCacheSize: 20,
    // Cache expiration time in milliseconds (24 hours)
    cacheExpiration: 24 * 60 * 60 * 1000,
    // Images to preload on app startup
    preloadImages: [
        backgroundAssets.categoryScreen.default.remote,
        backgroundAssets.topicList.default.remote,
        backgroundAssets.audioPlayer.default.remote,
    ],
    // Priority order for preloading
    preloadPriority: ['category-screen', 'topic-list', 'audio-player'] as const,
};

/**
 * Error handling and fallback configuration
 */
export const ERROR_HANDLING_CONFIG = {
    // Maximum retry attempts for failed image loads
    maxRetries: 3,
    // Retry delay in milliseconds
    retryDelay: 1000,
    // Fallback strategy: 'local' | 'color' | 'default'
    fallbackStrategy: 'local' as const,
    // Default fallback colors by context
    fallbackColors: {
        categoryScreen: '#1a1a1a',
        topicList: '#1e1e1e',
        audioPlayer: '#0f0f0f',
    },
};

/**
 * Performance optimization settings
 */
export const PERFORMANCE_SETTINGS = {
    // Enable lazy loading for non-critical images
    enableLazyLoading: true,
    // Enable image preloading for better UX
    enablePreloading: true,
    // Maximum concurrent image loads
    maxConcurrentLoads: 3,
    // Enable memory cleanup for unused images
    enableMemoryCleanup: true,
    // Memory cleanup interval in milliseconds (5 minutes)
    memoryCleanupInterval: 5 * 60 * 1000,
};

/**
 * Gets configuration for a specific context
 */
export const getContextConfig = (context: BackgroundContext) => {
    let contextType: keyof typeof OVERLAY_SETTINGS;

    switch (context.type) {
        case 'category-screen':
            contextType = 'categoryScreen';
            break;
        case 'topic-list':
            contextType = 'topicList';
            break;
        case 'audio-player':
            contextType = 'audioPlayer';
            break;
        default:
            contextType = 'categoryScreen';
    }

    return {
        overlay: OVERLAY_SETTINGS[contextType],
        quality: IMAGE_QUALITY_SETTINGS,
        cache: CACHE_SETTINGS,
        errorHandling: ERROR_HANDLING_CONFIG,
        performance: PERFORMANCE_SETTINGS,
    };
};

/**
 * Validates asset configuration completeness
 */
export const validateAssetConfiguration = (): {
    isValid: boolean;
    missingAssets: string[];
    errors: string[];
} => {
    const missingAssets: string[] = [];
    const errors: string[] = [];

    try {
        // Check category screen assets
        if (!backgroundAssets.categoryScreen.default.remote) {
            missingAssets.push('categoryScreen.default');
        }
        if (!backgroundAssets.categoryScreen.fallback.remote) {
            missingAssets.push('categoryScreen.fallback');
        }

        // Check topic list assets
        const requiredCategories = ['technology', 'science', 'history', 'business', 'health', 'arts', 'default'];
        requiredCategories.forEach(category => {
            if (!backgroundAssets.topicList[category as keyof typeof backgroundAssets.topicList]?.remote) {
                missingAssets.push(`topicList.${category}`);
            }
        });

        // Check audio player assets
        if (!backgroundAssets.audioPlayer.default.remote) {
            missingAssets.push('audioPlayer.default');
        }
        if (!backgroundAssets.audioPlayer.ambient || backgroundAssets.audioPlayer.ambient.length === 0) {
            missingAssets.push('audioPlayer.ambient');
        }

        return {
            isValid: missingAssets.length === 0 && errors.length === 0,
            missingAssets,
            errors,
        };
    } catch (error) {
        errors.push(`Configuration validation failed: ${error}`);
        return {
            isValid: false,
            missingAssets,
            errors,
        };
    }
};

/**
 * Gets asset statistics for monitoring and debugging
 */
export const getAssetStatistics = () => {
    const stats = {
        totalAssets: 0,
        categoryScreenAssets: 0,
        topicListAssets: 0,
        audioPlayerAssets: 0,
        ambientAssets: 0,
    };

    // Count category screen assets
    stats.categoryScreenAssets = Object.keys(backgroundAssets.categoryScreen).length;
    stats.totalAssets += stats.categoryScreenAssets;

    // Count topic list assets
    stats.topicListAssets = Object.keys(backgroundAssets.topicList).length;
    stats.totalAssets += stats.topicListAssets;

    // Count audio player assets
    stats.audioPlayerAssets = 1; // default
    stats.ambientAssets = backgroundAssets.audioPlayer.ambient.length;
    stats.totalAssets += stats.audioPlayerAssets + stats.ambientAssets;

    return stats;
};