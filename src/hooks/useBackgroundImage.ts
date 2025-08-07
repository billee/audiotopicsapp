import { useState, useEffect, useCallback, useRef } from 'react';
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

    const getBackgroundImage = useCallback((context: BackgroundContext): string | any => {
        console.log('getBackgroundImage called with context:', context);

        // Try to get local asset first, fallback to remote URL
        const localAsset = getLocalAssetByContext(context.type, context.categoryId);
        console.log('Local asset for', context.categoryId, ':', localAsset);

        if (localAsset) {
            console.log('Using local asset for', context.categoryId);
            return localAsset;
        }

        // Fallback to remote URL
        const remoteUrl = getRemoteUrlByContext(context.type, context.categoryId);
        console.log('Using remote URL for', context.categoryId, ':', remoteUrl);
        return remoteUrl;
    }, []);

    const preloadImages = useCallback(async (): Promise<void> => {
        const imagesToPreload: string[] = [
            config.categoryScreen.default,
            config.topicList.default,
            config.audioPlayer.default,
            ...Object.values(config.topicList).filter(url => typeof url === 'string'),
            ...config.audioPlayer.ambient,
        ];

        const uniqueImages = [...new Set(imagesToPreload)];

        try {
            // Preload critical images first (category screen and default topic list)
            const criticalImages = [
                config.categoryScreen.default,
                config.topicList.default,
                config.audioPlayer.default,
            ];

            const nonCriticalImages = uniqueImages.filter(uri => !criticalImages.includes(uri));

            // Preload critical images with high priority
            const criticalPromises = criticalImages
                .filter(uri => !preloadedImages.current.has(uri))
                .map(async (uri) => {
                    try {
                        await FastImage.preload([{
                            uri,
                            priority: FastImage.priority.high,
                            cache: FastImage.cacheControl.immutable,
                        }]);

                        preloadedImages.current.add(uri);

                        setImageCache(prev => ({
                            ...prev,
                            [uri]: {
                                loaded: true,
                                error: false,
                                lastAccessed: Date.now(),
                            },
                        }));
                    } catch (error) {
                        setImageCache(prev => ({
                            ...prev,
                            [uri]: {
                                loaded: false,
                                error: true,
                                lastAccessed: Date.now(),
                            },
                        }));
                    }
                });

            // Wait for critical images to load first
            await Promise.allSettled(criticalPromises);

            // Then preload non-critical images with normal priority
            const nonCriticalPromises = nonCriticalImages
                .filter(uri => !preloadedImages.current.has(uri))
                .map(async (uri) => {
                    try {
                        await FastImage.preload([{
                            uri,
                            priority: FastImage.priority.normal,
                            cache: FastImage.cacheControl.immutable,
                        }]);

                        preloadedImages.current.add(uri);

                        setImageCache(prev => ({
                            ...prev,
                            [uri]: {
                                loaded: true,
                                error: false,
                                lastAccessed: Date.now(),
                            },
                        }));
                    } catch (error) {
                        setImageCache(prev => ({
                            ...prev,
                            [uri]: {
                                loaded: false,
                                error: true,
                                lastAccessed: Date.now(),
                            },
                        }));
                    }
                });

            // Don't wait for non-critical images to complete
            Promise.allSettled(nonCriticalPromises);
        } catch (error) {
            console.warn('Failed to preload some background images:', error);
        }
    }, [config]);

    const isImageLoaded = useCallback((imageUri: string): boolean => {
        return imageCache[imageUri]?.loaded === true;
    }, [imageCache]);

    const getImageMetadata = useCallback((imageUri: string, context?: BackgroundContext): BackgroundImageMetadata | null => {
        const cacheEntry = imageCache[imageUri];
        if (!cacheEntry || !cacheEntry.loaded) {
            return null;
        }

        // Use the utility function to create metadata with proper context
        const defaultContext: BackgroundContext = context || { type: 'category-screen' };
        return createImageMetadata(imageUri, defaultContext);
    }, [imageCache]);

    // Cleanup old cache entries periodically
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            const maxAge = 30 * 60 * 1000; // 30 minutes

            setImageCache(prev => {
                const cleaned = { ...prev };
                Object.keys(cleaned).forEach(uri => {
                    if (now - cleaned[uri].lastAccessed > maxAge) {
                        delete cleaned[uri];
                        preloadedImages.current.delete(uri);
                    }
                });
                return cleaned;
            });
        }, 5 * 60 * 1000); // Run every 5 minutes

        return () => clearInterval(cleanupInterval);
    }, []);

    const preloadSpecificImage = useCallback(async (uri: string): Promise<boolean> => {
        if (preloadedImages.current.has(uri)) {
            return true;
        }

        try {
            await FastImage.preload([{
                uri,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
            }]);

            preloadedImages.current.add(uri);

            setImageCache(prev => ({
                ...prev,
                [uri]: {
                    loaded: true,
                    error: false,
                    lastAccessed: Date.now(),
                },
            }));

            return true;
        } catch (error) {
            setImageCache(prev => ({
                ...prev,
                [uri]: {
                    loaded: false,
                    error: true,
                    lastAccessed: Date.now(),
                },
            }));

            return false;
        }
    }, []);

    return {
        getBackgroundImage,
        preloadImages,
        preloadSpecificImage,
        isImageLoaded,
        getImageMetadata,
    };
};