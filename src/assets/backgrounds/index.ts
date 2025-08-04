/**
 * Background Image Assets Index
 * 
 * This file provides organized access to all background image assets
 * and their corresponding remote URLs for the application.
 */

// Category Screen Backgrounds
export const categoryScreenBackgrounds = {
    default: {
        local: require('./category-screen/default.jpg'),
        remote: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
        description: 'Professional audio/education themed background with warm, inviting colors'
    },
    fallback: {
        local: require('./category-screen/fallback.jpg'),
        remote: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&crop=center',
        description: 'Simple, elegant fallback background for category screen'
    }
};

// Topic List Backgrounds (Category-specific)
export const topicListBackgrounds = {
    technology: {
        local: require('./topic-list/technology.jpg'),
        remote: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
        description: 'Modern, tech-inspired imagery with circuit boards and digital elements'
    },
    science: {
        local: require('./topic-list/science.jpg'),
        remote: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop&crop=center',
        description: 'Laboratory, research, or nature themes with scientific equipment'
    },
    history: {
        local: require('./topic-list/history.jpg'),
        remote: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        description: 'Classical, archival, or timeline imagery with historical elements'
    },
    business: {
        local: require('./topic-list/business.jpg'),
        remote: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
        description: 'Professional business environment with modern office elements'
    },
    health: {
        local: require('./topic-list/health.jpg'),
        remote: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
        description: 'Health and wellness themed imagery with medical or fitness elements'
    },
    arts: {
        local: require('./topic-list/arts.jpg'),
        remote: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
        description: 'Creative arts imagery with artistic tools and colorful elements'
    },
    default: {
        local: require('./topic-list/default.jpg'),
        remote: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        description: 'Generic educational background suitable for any topic category'
    }
};

// Audio Player Backgrounds
export const audioPlayerBackgrounds = {
    default: {
        local: require('./audio-player/default.jpg'),
        remote: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
        description: 'Calming, focus-enhancing background for audio listening experience'
    },
    ambient: [
        {
            local: require('./audio-player/ambient-1.jpg'),
            remote: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
            description: 'Serene mountain landscape for focused listening'
        },
        {
            local: require('./audio-player/ambient-2.jpg'),
            remote: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
            description: 'Peaceful forest scene for ambient listening experience'
        },
        {
            local: require('./audio-player/ambient-3.jpg'),
            remote: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center',
            description: 'Tranquil ocean waves for relaxing audio experience'
        },
        {
            local: require('./audio-player/ambient-4.jpg'),
            remote: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
            description: 'Soft sunset gradient for evening listening sessions'
        }
    ]
};

// Consolidated export for easy access
export const backgroundAssets = {
    categoryScreen: categoryScreenBackgrounds,
    topicList: topicListBackgrounds,
    audioPlayer: audioPlayerBackgrounds
};

// Helper function to get remote URL by context
export const getRemoteUrlByContext = (context: string, categoryId?: string): string => {
    switch (context) {
        case 'category-screen':
            return categoryScreenBackgrounds.default.remote;
        case 'topic-list':
            if (categoryId && topicListBackgrounds[categoryId as keyof typeof topicListBackgrounds]) {
                return topicListBackgrounds[categoryId as keyof typeof topicListBackgrounds].remote;
            }
            return topicListBackgrounds.default.remote;
        case 'audio-player':
            return audioPlayerBackgrounds.default.remote;
        default:
            return categoryScreenBackgrounds.default.remote;
    }
};

// Helper function to get local asset by context
export const getLocalAssetByContext = (context: string, categoryId?: string): any => {
    switch (context) {
        case 'category-screen':
            return categoryScreenBackgrounds.default.local;
        case 'topic-list':
            if (categoryId && topicListBackgrounds[categoryId as keyof typeof topicListBackgrounds]) {
                return topicListBackgrounds[categoryId as keyof typeof topicListBackgrounds].local;
            }
            return topicListBackgrounds.default.local;
        case 'audio-player':
            return audioPlayerBackgrounds.default.local;
        default:
            return categoryScreenBackgrounds.default.local;
    }
};

// Get random ambient background for audio player
export const getRandomAmbientBackground = (): { local: any; remote: string; description: string } => {
    const ambientBackgrounds = audioPlayerBackgrounds.ambient;
    const randomIndex = Math.floor(Math.random() * ambientBackgrounds.length);
    return ambientBackgrounds[randomIndex];
};

// Get all available category IDs
export const getAvailableCategoryIds = (): string[] => {
    return Object.keys(topicListBackgrounds).filter(key => key !== 'default');
};

// Validate if a category has a specific background
export const hasCategoryBackground = (categoryId: string): boolean => {
    return categoryId in topicListBackgrounds && categoryId !== 'default';
};