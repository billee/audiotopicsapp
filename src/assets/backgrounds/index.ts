/**
 * Background Image Assets Index
 * 
 * This file provides organized access to all background image assets
 * and their corresponding remote URLs for the application.
 */

// Category Screen Backgrounds
export const categoryScreenBackgrounds = {
    default: {
        local: null, // Temporarily disabled - Metro bundler issue with jpg
        remote: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
        description: 'Peaceful forest scene perfect for Filipino audio content'
    },
    fallback: {
        local: null, // Temporarily disabled - using remote only
        remote: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center',
        description: 'Tranquil ocean waves as fallback background'
    }
};

// Topic List Backgrounds (Category-specific)
// Legacy English categories - maintained for backward compatibility
export const legacyTopicListBackgrounds = {
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

// Filipino Categories Background Mappings
export const filipinoTopicListBackgrounds = {
    'pamilya-sariling-buhay': {
        local: require('./topic-list/health.png'), // Family/personal life maps to health imagery
        remote: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
        description: 'Warm, family-oriented imagery for personal and family life topics',
        fallbackColor: '#E8F5E8'
    },
    'araw-araw-pamumuhay': {
        local: require('./topic-list/health.png'), // Daily life uses health imagery as safe fallback
        remote: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        description: 'Everyday life and local culture imagery',
        fallbackColor: '#FFF4E6'
    },
    'balita-kasalukuyang-pangyayari': {
        local: require('./topic-list/technology.png'), // News/current events uses technology imagery as safe fallback
        remote: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
        description: 'News and current events imagery with professional elements',
        fallbackColor: '#E6F3FF'
    },
    'damdamin-relasyon': {
        local: require('./topic-list/health.png'), // Emotions/relationships uses health imagery as safe fallback
        remote: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
        description: 'Emotional and relationship-focused imagery with artistic elements',
        fallbackColor: '#FFE6F0'
    },
    'mga-plano-pagkakataon': {
        local: require('./topic-list/technology.png'), // Plans/opportunities maps to technology (future-focused)
        remote: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
        description: 'Future plans and opportunities imagery with modern elements',
        fallbackColor: '#F0E6FF'
    },
    'libangan-kasiyahan': {
        local: require('./topic-list/health.png'), // Entertainment/fun uses health imagery as safe fallback
        remote: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
        description: 'Entertainment and fun imagery with colorful, joyful elements',
        fallbackColor: '#FFEB3B'
    },
    'mga-alaala-nostalgia': {
        local: require('./topic-list/health.png'), // Memories/nostalgia uses health imagery as safe fallback
        remote: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        description: 'Nostalgic and memory-focused imagery with historical elements',
        fallbackColor: '#E8E8E8'
    },
    default: {
        local: require('./topic-list/health.png'), // Use health.png as safe default
        remote: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
        description: 'Generic educational background suitable for any Filipino topic category',
        fallbackColor: '#F5F5F5'
    }
};

// Combined topic list backgrounds for backward compatibility
export const topicListBackgrounds = {
    ...legacyTopicListBackgrounds,
    ...filipinoTopicListBackgrounds
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
export const audioPlayerBackgrounds: { [key: string]: any } = {
    default: {
        local: null, // Temporarily disabled - using remote only
        remote: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
        description: 'Calming, focus-enhancing background for audio listening experience'
    },
    // Legacy English category fallbacks - using only verified working images
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
    // All other legacy categories use health.png as safe fallback
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
    // Filipino category fallbacks
    'pamilya-sariling-buhay': {
        local: require('./topic-list/health.png'),
        remote: null,
        description: 'Family and personal life background',
        fallbackColor: '#E8F5E8'
    },
    'araw-araw-pamumuhay': {
        local: require('./topic-list/health.png'), // Use health.png as safe fallback
        remote: null,
        description: 'Daily life and local culture background',
        fallbackColor: '#FFF4E6'
    },
    'balita-kasalukuyang-pangyayari': {
        local: require('./topic-list/technology.png'),
        remote: null,
        description: 'News and current events background',
        fallbackColor: '#E6F3FF'
    },
    'damdamin-relasyon': {
        local: require('./topic-list/health.png'),
        remote: null,
        description: 'Emotions and relationships background',
        fallbackColor: '#FFE6F0'
    },
    'mga-plano-pagkakataon': {
        local: require('./topic-list/technology.png'),
        remote: null,
        description: 'Plans and opportunities background',
        fallbackColor: '#F0E6FF'
    },
    'libangan-kasiyahan': {
        local: require('./topic-list/health.png'),
        remote: null,
        description: 'Entertainment and fun background',
        fallbackColor: '#FFEB3B'
    },
    'mga-alaala-nostalgia': {
        local: require('./topic-list/health.png'),
        remote: null,
        description: 'Memories and nostalgia background',
        fallbackColor: '#E8E8E8'
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
                // First check if it's a Filipino category ID (string format)
                if (filipinoTopicListBackgrounds[categoryId as keyof typeof filipinoTopicListBackgrounds]) {
                    const url = filipinoTopicListBackgrounds[categoryId as keyof typeof filipinoTopicListBackgrounds].remote;
                    console.log('Found Filipino background URL for', categoryId, ':', url);
                    return url || filipinoTopicListBackgrounds.default.remote;
                }

                // Map numeric category IDs to legacy category names for backward compatibility
                const legacyCategoryMapping: { [key: string]: string } = {
                    '1': 'technology',
                    '2': 'science',
                    '3': 'history',
                    '4': 'arts',
                    '5': 'business',
                    '6': 'health',
                };

                // Map numeric category IDs to Filipino category IDs
                const filipinoCategoryMapping: { [key: string]: string } = {
                    '1': 'pamilya-sariling-buhay',
                    '2': 'araw-araw-pamumuhay',
                    '3': 'balita-kasalukuyang-pangyayari',
                    '4': 'damdamin-relasyon',
                    '5': 'mga-plano-pagkakataon',
                    '6': 'libangan-kasiyahan',
                    '7': 'mga-alaala-nostalgia',
                };

                // Try Filipino mapping first
                const filipinoCategoryName = filipinoCategoryMapping[categoryId];
                if (filipinoCategoryName && filipinoTopicListBackgrounds[filipinoCategoryName as keyof typeof filipinoTopicListBackgrounds]) {
                    const url = filipinoTopicListBackgrounds[filipinoCategoryName as keyof typeof filipinoTopicListBackgrounds].remote;
                    console.log('Found Filipino background URL for numeric ID', categoryId, 'mapped to', filipinoCategoryName, ':', url);
                    return url || filipinoTopicListBackgrounds.default.remote;
                }

                // Fallback to legacy mapping
                const legacyCategoryName = legacyCategoryMapping[categoryId] || categoryId;
                console.log('Mapped categoryId', categoryId, 'to legacy categoryName:', legacyCategoryName);

                if (legacyTopicListBackgrounds[legacyCategoryName as keyof typeof legacyTopicListBackgrounds]) {
                    const url = legacyTopicListBackgrounds[legacyCategoryName as keyof typeof legacyTopicListBackgrounds].remote;
                    console.log('Found legacy background URL for', legacyCategoryName, ':', url);

                    // If remote URL is null, return default
                    if (!url) {
                        console.log('Remote URL is null for', legacyCategoryName, 'using default');
                        return topicListBackgrounds.default.remote;
                    }
                    return url;
                } else {
                    console.log('No background found for', legacyCategoryName, 'using default');
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
        // First check if it's a Filipino category ID (string format)
        if (audioPlayerBackgrounds[categoryId as keyof typeof audioPlayerBackgrounds]) {
            console.log('Using Filipino category background for:', categoryId);
            return audioPlayerBackgrounds[categoryId as keyof typeof audioPlayerBackgrounds].local;
        }

        // Map numeric category IDs to Filipino category IDs
        const filipinoCategoryMapping: { [key: string]: string } = {
            '1': 'pamilya-sariling-buhay',
            '2': 'araw-araw-pamumuhay',
            '3': 'balita-kasalukuyang-pangyayari',
            '4': 'damdamin-relasyon',
            '5': 'mga-plano-pagkakataon',
            '6': 'libangan-kasiyahan',
            '7': 'mga-alaala-nostalgia',
        };

        // Try Filipino mapping first
        const filipinoCategoryName = filipinoCategoryMapping[categoryId];
        if (filipinoCategoryName && audioPlayerBackgrounds[filipinoCategoryName as keyof typeof audioPlayerBackgrounds]) {
            console.log('Using Filipino category background for numeric ID', categoryId, 'mapped to', filipinoCategoryName);
            return audioPlayerBackgrounds[filipinoCategoryName as keyof typeof audioPlayerBackgrounds].local;
        }

        // Fallback to legacy category mapping
        const legacyCategoryMapping: { [key: string]: string } = {
            '1': 'technology',
            '2': 'science',
            '3': 'history',
            '4': 'arts',
            '5': 'business',
            '6': 'health',
        };

        const legacyCategoryName = legacyCategoryMapping[categoryId] || categoryId;
        console.log('Using legacy category fallback for:', legacyCategoryName);

        if (audioPlayerBackgrounds[legacyCategoryName as keyof typeof audioPlayerBackgrounds]) {
            return audioPlayerBackgrounds[legacyCategoryName as keyof typeof audioPlayerBackgrounds].local;
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
        // First check if it's a Filipino category ID (string format)
        if (audioPlayerBackgrounds[categoryId as keyof typeof audioPlayerBackgrounds]) {
            return audioPlayerBackgrounds[categoryId as keyof typeof audioPlayerBackgrounds].remote || audioPlayerBackgrounds.default.remote;
        }

        // Map numeric category IDs to Filipino category IDs
        const filipinoCategoryMapping: { [key: string]: string } = {
            '1': 'pamilya-sariling-buhay',
            '2': 'araw-araw-pamumuhay',
            '3': 'balita-kasalukuyang-pangyayari',
            '4': 'damdamin-relasyon',
            '5': 'mga-plano-pagkakataon',
            '6': 'libangan-kasiyahan',
            '7': 'mga-alaala-nostalgia',
        };

        // Try Filipino mapping first
        const filipinoCategoryName = filipinoCategoryMapping[categoryId];
        if (filipinoCategoryName && audioPlayerBackgrounds[filipinoCategoryName as keyof typeof audioPlayerBackgrounds]) {
            return audioPlayerBackgrounds[filipinoCategoryName as keyof typeof audioPlayerBackgrounds].remote || audioPlayerBackgrounds.default.remote;
        }

        // Fallback to legacy category mapping
        const legacyCategoryMapping: { [key: string]: string } = {
            '1': 'technology',
            '2': 'science',
            '3': 'history',
            '4': 'arts',
            '5': 'business',
            '6': 'health',
        };

        const categoryName = legacyCategoryMapping[categoryId] || categoryId;

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
                // First check if it's a Filipino category ID (string format)
                if (filipinoTopicListBackgrounds[categoryId as keyof typeof filipinoTopicListBackgrounds]) {
                    return filipinoTopicListBackgrounds[categoryId as keyof typeof filipinoTopicListBackgrounds].local;
                }

                // Map numeric category IDs to Filipino category IDs
                const filipinoCategoryMapping: { [key: string]: string } = {
                    '1': 'pamilya-sariling-buhay',
                    '2': 'araw-araw-pamumuhay',
                    '3': 'balita-kasalukuyang-pangyayari',
                    '4': 'damdamin-relasyon',
                    '5': 'mga-plano-pagkakataon',
                    '6': 'libangan-kasiyahan',
                    '7': 'mga-alaala-nostalgia',
                };

                // Try Filipino mapping first
                const filipinoCategoryName = filipinoCategoryMapping[categoryId];
                if (filipinoCategoryName && filipinoTopicListBackgrounds[filipinoCategoryName as keyof typeof filipinoTopicListBackgrounds]) {
                    return filipinoTopicListBackgrounds[filipinoCategoryName as keyof typeof filipinoTopicListBackgrounds].local;
                }

                // Fallback to legacy category mapping
                const legacyCategoryMapping: { [key: string]: string } = {
                    '1': 'technology',
                    '2': 'science',
                    '3': 'history',
                    '4': 'arts',
                    '5': 'business',
                    '6': 'health',
                };

                // Use mapped name if it's a numeric ID, otherwise use as-is
                const categoryName = legacyCategoryMapping[categoryId] || categoryId;

                if (legacyTopicListBackgrounds[categoryName as keyof typeof legacyTopicListBackgrounds]) {
                    return legacyTopicListBackgrounds[categoryName as keyof typeof legacyTopicListBackgrounds].local;
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

// Filipino Category Background Helper Functions

// Get Filipino category background with fallback color support
export const getFilipinoCategoryBackground = (categoryId: string): { local: any; remote: string; fallbackColor: string } => {
    if (filipinoTopicListBackgrounds[categoryId as keyof typeof filipinoTopicListBackgrounds]) {
        const bg = filipinoTopicListBackgrounds[categoryId as keyof typeof filipinoTopicListBackgrounds];
        return {
            local: bg.local,
            remote: bg.remote,
            fallbackColor: bg.fallbackColor
        };
    }

    // Return default with fallback color
    return {
        local: filipinoTopicListBackgrounds.default.local,
        remote: filipinoTopicListBackgrounds.default.remote,
        fallbackColor: filipinoTopicListBackgrounds.default.fallbackColor
    };
};

// Get fallback color for a Filipino category
export const getFilipinoCategoryFallbackColor = (categoryId: string): string => {
    // Map numeric IDs to Filipino category IDs
    const filipinoCategoryMapping: { [key: string]: string } = {
        '1': 'pamilya-sariling-buhay',
        '2': 'araw-araw-pamumuhay',
        '3': 'balita-kasalukuyang-pangyayari',
        '4': 'damdamin-relasyon',
        '5': 'mga-plano-pagkakataon',
        '6': 'libangan-kasiyahan',
        '7': 'mga-alaala-nostalgia',
    };

    const mappedCategoryId = filipinoCategoryMapping[categoryId] || categoryId;

    if (filipinoTopicListBackgrounds[mappedCategoryId as keyof typeof filipinoTopicListBackgrounds]) {
        return filipinoTopicListBackgrounds[mappedCategoryId as keyof typeof filipinoTopicListBackgrounds].fallbackColor;
    }

    return filipinoTopicListBackgrounds.default.fallbackColor;
};

// Check if a category ID is a Filipino category
export const isFilipinoCategory = (categoryId: string): boolean => {
    return categoryId in filipinoTopicListBackgrounds && categoryId !== 'default';
};

// Get all available Filipino category IDs
export const getAvailableFilipinoCategoryIds = (): string[] => {
    return Object.keys(filipinoTopicListBackgrounds).filter(key => key !== 'default');
};

// Map numeric category ID to Filipino category ID
export const mapNumericToFilipinoCategory = (numericId: string): string | null => {
    const filipinoCategoryMapping: { [key: string]: string } = {
        '1': 'pamilya-sariling-buhay',
        '2': 'araw-araw-pamumuhay',
        '3': 'balita-kasalukuyang-pangyayari',
        '4': 'damdamin-relasyon',
        '5': 'mga-plano-pagkakataon',
        '6': 'libangan-kasiyahan',
        '7': 'mga-alaala-nostalgia',
    };

    return filipinoCategoryMapping[numericId] || null;
};

// Enhanced background resolution with fallback support
export const getBackgroundWithFallback = (context: string, categoryId?: string, topicId?: string): {
    local: any;
    remote: string;
    fallbackColor?: string;
} => {
    const local = getLocalAssetByContext(context, categoryId, topicId);
    const remote = getRemoteUrlByContext(context, categoryId, topicId);

    // Get fallback color for Filipino categories
    let fallbackColor: string | undefined;
    if (categoryId && context === 'topic-list') {
        fallbackColor = getFilipinoCategoryFallbackColor(categoryId);
    }

    return {
        local,
        remote,
        fallbackColor
    };
};