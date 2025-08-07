/**
 * Background Image Assets Index
 * 
 * This file provides organized access to all background image assets
 * and their corresponding remote URLs for the application.
 */

// Category Screen Backgrounds
export const categoryScreenBackgrounds = {
    default: {
        local: null, // Temporarily disabled - using remote only
        remote: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
        description: 'Professional audio/education themed background with warm, inviting colors'
    },
    fallback: {
        local: null, // Temporarily disabled - using remote only
        remote: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&crop=center',
        description: 'Simple, elegant fallback background for category screen'
    }
};

// Topic List Backgrounds (Category-specific)
export const topicListBackgrounds = {
    technology: {
        local: require('./topic-list/technology.png'),
        remote: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
        description: 'Modern, tech-inspired imagery with circuit boards and digital elements'
    },
    science: {
        local: null,
        remote: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        description: 'Laboratory, research, or nature themes with scientific equipment'
    },
    history: {
        local: null, // Temporarily disabled - using remote only
        remote: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        description: 'Classical, archival, or timeline imagery with historical elements'
    },
    business: {
        local: null, // Temporarily disabled - using remote only
        remote: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
        description: 'Professional business environment with modern office elements'
    },
    health: {
        local: null,
        remote: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
        description: 'Health and wellness themed imagery with medical or fitness elements'
    },
    arts: {
        local: null, // Temporarily disabled - using remote only
        remote: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
        description: 'Creative arts imagery with artistic tools and colorful elements'
    },
    default: {
        local: null, // Temporarily disabled - using remote only
        remote: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        description: 'Generic educational background suitable for any topic category'
    }
};

// Audio Player Backgrounds - Topic Specific Configuration
// Using only verified working images: health.png and technology.png
export const topicAudioPlayerBackgrounds = [
    // Science Topics - All use health.png (verified working)
    {
        topicId: '1', // Replace with actual topic IDs
        categoryId: '2', // Science category
        title: 'Climate Crisis Topic',
        background: {
            local: require('./topic-list/health.png'),
            remote: null,
            description: 'Health professional background for climate science topic'
        }
    },
    {
        topicId: '2', // Replace with actual topic IDs  
        categoryId: '2', // Science category
        title: 'Biology Topic',
        background: {
            local: require('./topic-list/health.png'),
            remote: null,
            description: 'Health-themed background for biology topic'
        }
    },
    // Technology Topics - Use technology.png (verified working)
    {
        topicId: '3', // Replace with actual topic IDs
        categoryId: '1', // Technology category
        title: 'AI Technology Topic',
        background: {
            local: require('./topic-list/technology.png'),
            remote: null,
            description: 'Technology background for AI topic'
        }
    },
    // All other categories use health.png as safe fallback
    // Add more topics as needed using only health.png or technology.png
];

// Audio Player Backgrounds - Category Fallbacks
export const audioPlayerBackgrounds = {
    default: {
        local: null, // Temporarily disabled - using remote only
        remote: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
        description: 'Calming, focus-enhancing background for audio listening experience'
    },
    // Category-specific fallbacks - using only verified working images
    science: {
        local: require('./topic-list/health.png'),
        remote: null,
        description: 'Science background using health.png'
    },
    technology: {
        local: require('./topic-list/technology.png'),
        remote: null,
        description: 'Technology background'
    },
    // All other categories use health.png as safe fallback
    history: {
        local: require('./topic-list/health.png'),
        remote: null,
        description: 'History background (health.png fallback)'
    },
    arts: {
        local: require('./topic-list/health.png'),
        remote: null,
        description: 'Arts background (health.png fallback)'
    },
    business: {
        local: require('./topic-list/health.png'),
        remote: null,
        description: 'Business background (health.png fallback)'
    },
    health: {
        local: require('./topic-list/health.png'),
        remote: null,
        description: 'Health background'
    },
    ambient: [
        {
            local: null, // Temporarily disabled - using remote only
            remote: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
            description: 'Serene mountain landscape for focused listening'
        },
        {
            local: null, // Temporarily disabled - using remote only
            remote: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
            description: 'Peaceful forest scene for ambient listening experience'
        },
        {
            local: null, // Temporarily disabled - using remote only
            remote: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center',
            description: 'Tranquil ocean waves for relaxing audio experience'
        },
        {
            local: null, // Temporarily disabled - using remote only
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
export const getRemoteUrlByContext = (context: string, categoryId?: string, topicId?: string): string => {
    console.log('getRemoteUrlByContext called with:', context, categoryId);

    switch (context) {
        case 'category-screen':
            return categoryScreenBackgrounds.default.remote;
        case 'topic-list':
            if (categoryId) {
                // Map numeric category IDs to category names
                const categoryMapping: { [key: string]: string } = {
                    '1': 'technology',
                    '2': 'science',
                    '3': 'history',
                    '4': 'arts',
                    '5': 'business',
                    '6': 'health',
                };

                // Use mapped name if it's a numeric ID, otherwise use as-is
                const categoryName = categoryMapping[categoryId] || categoryId;
                console.log('Mapped categoryId', categoryId, 'to categoryName:', categoryName);

                if (topicListBackgrounds[categoryName as keyof typeof topicListBackgrounds]) {
                    const url = topicListBackgrounds[categoryName as keyof typeof topicListBackgrounds].remote;
                    console.log('Found background URL for', categoryName, ':', url);

                    // If remote URL is null, return default
                    if (!url) {
                        console.log('Remote URL is null for', categoryName, 'using default');
                        return topicListBackgrounds.default.remote;
                    }
                    return url;
                } else {
                    console.log('No background found for', categoryName, 'using default');
                }
            }
            return topicListBackgrounds.default.remote;
        case 'audio-player':
            // Use new topic-specific background system
            return getTopicAudioPlayerRemoteUrl(topicId, categoryId);
        default:
            return categoryScreenBackgrounds.default.remote;
    }
};

// Helper function to get topic-specific background
export const getTopicAudioPlayerBackground = (topicId?: string, categoryId?: string): any => {
    console.log('Looking for topic-specific background:', { topicId, categoryId });

    // First, try to find topic-specific background
    if (topicId) {
        const topicBackground = topicAudioPlayerBackgrounds.find(
            item => item.topicId === topicId
        );

        if (topicBackground) {
            console.log('Found topic-specific background for:', topicId);
            return topicBackground.background.local;
        }
    }

    // Fallback to category-specific background
    if (categoryId) {
        const categoryMapping: { [key: string]: string } = {
            '1': 'technology',
            '2': 'science',
            '3': 'history',
            '4': 'arts',
            '5': 'business',
            '6': 'health',
        };

        const categoryName = categoryMapping[categoryId] || categoryId;
        console.log('Using category fallback for:', categoryName);

        if (audioPlayerBackgrounds[categoryName as keyof typeof audioPlayerBackgrounds]) {
            return audioPlayerBackgrounds[categoryName as keyof typeof audioPlayerBackgrounds].local;
        }
    }

    // Final fallback to default
    console.log('Using default audio player background');
    return audioPlayerBackgrounds.default.local;
};

// Helper function to get topic-specific remote URL
export const getTopicAudioPlayerRemoteUrl = (topicId?: string, categoryId?: string): string => {
    // First, try to find topic-specific background
    if (topicId) {
        const topicBackground = topicAudioPlayerBackgrounds.find(
            item => item.topicId === topicId
        );

        if (topicBackground && topicBackground.background.remote) {
            return topicBackground.background.remote;
        }
    }

    // Fallback to category-specific background
    if (categoryId) {
        const categoryMapping: { [key: string]: string } = {
            '1': 'technology',
            '2': 'science',
            '3': 'history',
            '4': 'arts',
            '5': 'business',
            '6': 'health',
        };

        const categoryName = categoryMapping[categoryId] || categoryId;

        if (audioPlayerBackgrounds[categoryName as keyof typeof audioPlayerBackgrounds]) {
            return audioPlayerBackgrounds[categoryName as keyof typeof audioPlayerBackgrounds].remote || audioPlayerBackgrounds.default.remote;
        }
    }

    // Final fallback to default
    return audioPlayerBackgrounds.default.remote;
};

// Helper function to get local asset by context
export const getLocalAssetByContext = (context: string, categoryId?: string, topicId?: string): any => {
    switch (context) {
        case 'category-screen':
            return categoryScreenBackgrounds.default.local;
        case 'topic-list':
            if (categoryId) {
                // Map numeric category IDs to category names
                const categoryMapping: { [key: string]: string } = {
                    '1': 'technology',
                    '2': 'science',
                    '3': 'history',
                    '4': 'arts',
                    '5': 'business',
                    '6': 'health',
                };

                // Use mapped name if it's a numeric ID, otherwise use as-is
                const categoryName = categoryMapping[categoryId] || categoryId;

                if (topicListBackgrounds[categoryName as keyof typeof topicListBackgrounds]) {
                    return topicListBackgrounds[categoryName as keyof typeof topicListBackgrounds].local;
                }
            }
            return topicListBackgrounds.default.local;
        case 'audio-player':
            // Use new topic-specific background system
            return getTopicAudioPlayerBackground(topicId, categoryId);
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

// Helper functions for managing topic audio player backgrounds
// Note: Due to React Native limitations, backgrounds must be added directly to the topicAudioPlayerBackgrounds array above
// Dynamic require() is not supported, so use the static array configuration instead

// Get all topic backgrounds for a specific category
export const getTopicBackgroundsByCategory = (categoryId: string) => {
    return topicAudioPlayerBackgrounds.filter(item => item.categoryId === categoryId);
};

// Get topic background info
export const getTopicBackgroundInfo = (topicId: string) => {
    return topicAudioPlayerBackgrounds.find(item => item.topicId === topicId);
};