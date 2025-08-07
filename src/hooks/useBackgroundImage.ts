import { useState, useEffect, useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import {
    BackgroundContext,
    BackgroundImageHook,
    BackgroundImageCache,
    BackgroundImageMetadata,
    BackgroundConfig,
} from '../types/backgroundImage';
import {
    createImageMetadata,
    getOptimalOverlayOpacity,
    getFallbackColor,
    mapCategoryIdToName
} from '../utils/backgroundImages';
import { backgroundAssets, getLocalAssetByContext, getRemoteUrlByContext } from '../assets/backgrounds';
import {
    getResponsiveDimensions,
    generateResponsiveImageUrls,
    getOptimalImageSize,
    getResponsiveImageCacheKey
} from '../utils/responsive';

// Default background configuration
const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
    categoryScreen: {
        default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
        fallback: '#1a1a1a',
    },
    topicList: {
        technology: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
        science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop&crop=center',
        history: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
        health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
        arts: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
        education: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
    },
    audioPlayer: {
        default: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
        ambient: [
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
        ],
    },
};

export const useBackgroundImage = (
    config: BackgroundConfig = DEFAULT_BACKGROUND_CONFIG
): BackgroundImageHook => {
    const [imageCache, setImageCache] = useState<BackgroundImageCache>({});
    const preloadedImages = useRef<Set<string>>(new Set());
    const ambientRotationIndex = useRef<number>(0);
    const [screenDimensions, setScreenDimensions] = useState(() => {
        try {
            return Dimensions.get('window');
        } catch {
            return { width: 375, height: 812 };
        }
    });

    // Track screen dimension changes for responsive images
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setScreenDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    const getBackgroundImage = useCallback((context: BackgroundContext, enableResponsive: boolean = true): string | any => {
        console.log('getBackgroundImage called with context:', context);

        // Try to get local asset first, fallback to remote URL
        const localAsset = getLocalAssetByContext(context.type, context.categoryId, context.topicId);
        console.log('Local asset for topic:', context.topicId, 'category:', context.categoryId, ':', localAsset);

        if (localAsset) {
            console.log('Using local asset for topic:', context.topicId, 'category:', context.categoryId);
            return localAsset;
        }

        // Get remote URL and make it responsive if enabled
        const remoteUrl = getRemoteUrlByContext(context.type, context.categoryId, context.topicId);
        console.log('Using remote URL for topic:', context.topicId, 'category:', context.categoryId, ':', remoteUrl);

        // If no remote URL available, return a fallback
        if (!remoteUrl) {
            console.log('No remote URL available, using fallback color');
            return null; // This will trigger the fallback color in BackgroundImage
        }

        if (enableResponsive && remoteUrl && remoteUrl.includes('unsplash.com')) {
            try {
                const responsiveUrls = generateResponsiveImageUrls(remoteUrl);
                const optimalSize = getOptimalImageSize(screenDimensions.width, screenDimensions.height);
                const optimizedUrl = responsiveUrls[optimalSize];
                console.log('Using responsive URL:', optimizedUrl, 'for size:', optimalSize);
                return optimizedUrl;
            } catch (error) {
                console.warn('Failed to generate responsive URL, using original:', error);
                return remoteUrl;
            }
        }

        return remoteUrl;
    }, [screenDimensions]);

    const preloadImages = useCallback(async (): Promise<void> => {
        // Generate responsive URLs for all images
        const baseImages = [
            config.categoryScreen.default,
            config.topicList.default,
            config.audioPlayer.default,
            ...Object.values(config.topicList).filter(url => typeof url === 'string'),
            ...config.audioPlayer.ambient,
        ];

        const uniqueBaseImages = [...new Set(baseImages)];
        const optimalSize = getOptimalImageSize(screenDimensions.width, screenDimensions.height);

        // Generate responsive URLs for current screen size
        const imagesToPreload = uniqueBaseImages.map(uri => {
            if (uri.includes('unsplash.com')) {
                const responsiveUrls = generateResponsiveImageUrls(uri);
                return responsiveUrls[optimalSize];
            }
            return uri;
        });

        try {
            // Preload critical images first (category screen and default topic list)
            const criticalBaseImages = [
                config.categoryScreen.default,
                config.topicList.default,
                config.audioPlayer.default,
            ];

            const criticalImages = criticalBaseImages.map(uri => {
                if (uri.includes('unsplash.com')) {
                    const responsiveUrls = generateResponsiveImageUrls(uri);
                    return responsiveUrls[optimalSize];
                }
                return uri;
            });

            const nonCriticalImages = imagesToPreload.filter(uri => !criticalImages.includes(uri));

            // Preload critical images with high priority
            const criticalPromises = criticalImages
                .filter(uri => {
                    const cacheKey = getResponsiveImageCacheKey(uri, screenDimensions.width, screenDimensions.height);
                    return !preloadedImages.current.has(cacheKey);
                })
                .map(async (uri) => {
                    const cacheKey = getResponsiveImageCacheKey(uri, screenDimensions.width, screenDimensions.height);

                    try {
                        await FastImage.preload([{
                            uri,
                            priority: FastImage.priority.high,
                            cache: FastImage.cacheControl.immutable,
                        }]);

                        preloadedImages.current.add(cacheKey);

                        setImageCache(prev => ({
                            ...prev,
                            [cacheKey]: {
                                loaded: true,
                                error: false,
                                lastAccessed: Date.now(),
                            },
                        }));
                    } catch (error) {
                        setImageCache(prev => ({
                            ...prev,
                            [cacheKey]: {
                                loaded: false,
                                error: true,
                                lastAccessed: Date.now(),
                            },
                        }));
                    }
                });

            // Wait for critical images to load first
            await Promise.allSettled(criticalPromises);

            // Then preload non-critical images with normal priority (lazy loading)
            const nonCriticalPromises = nonCriticalImages
                .filter(uri => {
                    const cacheKey = getResponsiveImageCacheKey(uri, screenDimensions.width, screenDimensions.height);
                    return !preloadedImages.current.has(cacheKey);
                })
                .map(async (uri, index) => {
                    // Stagger non-critical image loading to avoid overwhelming the network
                    await new Promise(resolve => setTimeout(resolve, index * 100));

                    const cacheKey = getResponsiveImageCacheKey(uri, screenDimensions.width, screenDimensions.height);

                    try {
                        await FastImage.preload([{
                            uri,
                            priority: FastImage.priority.normal,
                            cache: FastImage.cacheControl.immutable,
                        }]);

                        preloadedImages.current.add(cacheKey);

                        setImageCache(prev => ({
                            ...prev,
                            [cacheKey]: {
                                loaded: true,
                                error: false,
                                lastAccessed: Date.now(),
                            },
                        }));
                    } catch (error) {
                        setImageCache(prev => ({
                            ...prev,
                            [cacheKey]: {
                                loaded: false,
                                error: true,
                                lastAccessed: Date.now(),
                            },
                        }));
                    }
                });

            // Don't wait for non-critical images to complete (lazy loading)
            Promise.allSettled(nonCriticalPromises);
        } catch (error) {
            console.warn('Failed to preload some background images:', error);
        }
    }, [config, screenDimensions]);

    const isImageLoaded = useCallback((imageUri: string): boolean => {
        // Check both the direct URI and the responsive cache key
        const directCheck = imageCache[imageUri]?.loaded === true;
        const cacheKey = getResponsiveImageCacheKey(imageUri, screenDimensions.width, screenDimensions.height);
        const responsiveCheck = imageCache[cacheKey]?.loaded === true;

        return directCheck || responsiveCheck;
    }, [imageCache, screenDimensions]);

    const getImageMetadata = useCallback((imageUri: string, context?: BackgroundContext): BackgroundImageMetadata | null => {
        const cacheEntry = imageCache[imageUri];
        if (!cacheEntry || !cacheEntry.loaded) {
            return null;
        }

        // Use the utility function to create metadata with proper context
        const defaultContext: BackgroundContext = context || { type: 'category-screen' };
        return createImageMetadata(imageUri, defaultContext);
    }, [imageCache]);

    // Enhanced cache cleanup with memory management
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            const maxAge = 20 * 60 * 1000; // 20 minutes (reduced for better memory management)
            const maxCacheSize = 50; // Maximum number of cached images

            setImageCache(prev => {
                const cleaned = { ...prev };
                const entries = Object.entries(cleaned);

                // Remove old entries
                entries.forEach(([uri, entry]) => {
                    if (now - entry.lastAccessed > maxAge) {
                        delete cleaned[uri];
                        preloadedImages.current.delete(uri);
                    }
                });

                // If still too many entries, remove oldest ones
                const remainingEntries = Object.entries(cleaned);
                if (remainingEntries.length > maxCacheSize) {
                    const sortedByAge = remainingEntries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
                    const toRemove = sortedByAge.slice(0, remainingEntries.length - maxCacheSize);

                    toRemove.forEach(([uri]) => {
                        delete cleaned[uri];
                        preloadedImages.current.delete(uri);
                    });
                }

                return cleaned;
            });

            // Clear FastImage cache periodically to free memory
            if (Math.random() < 0.1) { // 10% chance each cleanup cycle
                FastImage.clearMemoryCache();
            }
        }, 3 * 60 * 1000); // Run every 3 minutes (more frequent)

        return () => clearInterval(cleanupInterval);
    }, []);

    // Clear cache when screen dimensions change significantly
    useEffect(() => {
        const currentSize = getOptimalImageSize(screenDimensions.width, screenDimensions.height);

        // Clear cache entries that don't match current screen size
        setImageCache(prev => {
            const cleaned = { ...prev };
            Object.keys(cleaned).forEach(cacheKey => {
                if (cacheKey.includes('_') && !cacheKey.includes(`_${currentSize}_`)) {
                    delete cleaned[cacheKey];
                    preloadedImages.current.delete(cacheKey);
                }
            });
            return cleaned;
        });
    }, [screenDimensions]);

    const preloadSpecificImage = useCallback(async (uri: string, enableResponsive: boolean = true): Promise<boolean> => {
        // Generate responsive URL if enabled
        let targetUri = uri;
        if (enableResponsive && uri.includes('unsplash.com')) {
            const responsiveUrls = generateResponsiveImageUrls(uri);
            const optimalSize = getOptimalImageSize(screenDimensions.width, screenDimensions.height);
            targetUri = responsiveUrls[optimalSize];
        }

        const cacheKey = getResponsiveImageCacheKey(targetUri, screenDimensions.width, screenDimensions.height);

        if (preloadedImages.current.has(cacheKey)) {
            return true;
        }

        try {
            await FastImage.preload([{
                uri: targetUri,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
            }]);

            preloadedImages.current.add(cacheKey);

            setImageCache(prev => ({
                ...prev,
                [cacheKey]: {
                    loaded: true,
                    error: false,
                    lastAccessed: Date.now(),
                },
            }));

            return true;
        } catch (error) {
            setImageCache(prev => ({
                ...prev,
                [cacheKey]: {
                    loaded: false,
                    error: true,
                    lastAccessed: Date.now(),
                },
            }));

            return false;
        }
    }, [screenDimensions]);

    return {
        getBackgroundImage,
        preloadImages,
        preloadSpecificImage,
        isImageLoaded,
        getImageMetadata,
    };
};