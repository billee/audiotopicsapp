// Background image related types and interfaces

export type BackgroundContext =
    | { type: 'category-screen' }
    | { type: 'topic-list'; categoryId: string }
    | { type: 'audio-player'; topicId?: string };

export interface BackgroundImageMetadata {
    id: string;
    uri: string;
    context: BackgroundContext;
    overlayRecommended: boolean;
    overlayOpacity: number;
    primaryColor: string;
    contrastRatio: number;
}

export interface BackgroundConfig {
    categoryScreen: {
        default: string;
        fallback: string;
    };
    topicList: {
        [categoryId: string]: string;
        default: string;
    };
    audioPlayer: {
        default: string;
        ambient: string[];
    };
}

export interface BackgroundImageHook {
    getBackgroundImage: (context: BackgroundContext) => string;
    preloadImages: () => Promise<void>;
    preloadSpecificImage: (uri: string) => Promise<boolean>;
    isImageLoaded: (imageUri: string) => boolean;
    getImageMetadata: (imageUri: string) => BackgroundImageMetadata | null;
}

export interface BackgroundImageLoadState {
    isLoading: boolean;
    hasError: boolean;
    imageLoaded: boolean;
    error: any;
}

export interface BackgroundImageCache {
    [uri: string]: {
        loaded: boolean;
        error: boolean;
        metadata?: BackgroundImageMetadata;
        lastAccessed: number;
    };
}