/**
 * Filipino Categories Configuration
 * 
 * This file contains the configuration for Filipino-focused categories
 * that replace the English categories with culturally relevant options.
 */

export interface FilipinoCategory {
    id: string;
    numericId: number; // For backward compatibility
    name: string; // Filipino name
    englishName: string; // English reference
    description: string; // Filipino description
    englishDescription: string; // English reference
    backgroundColor: string;
    textColor: string;
    backgroundImage?: string;
    icon?: string;
    layoutPosition: {
        row: number;
        column: number;
        span?: number; // For larger cards
    };
}

export interface CategoryLayoutConfig {
    gridRows: number;
    gridColumns: number;
    cardSpacing: number;
    cardBorderRadius: number;
    filipinoColorScheme: {
        primary: string;
        secondary: string;
        accent: string;
        warm: string[];
    };
}

/**
 * Filipino Categories - 7 culturally relevant categories
 * Layout: 3x3 grid with bottom category spanning full width
 */
export const FILIPINO_CATEGORIES: FilipinoCategory[] = [
    {
        id: 'cat1',
        numericId: 1,
        name: 'Pamilya at Sariling Buhay',
        englishName: 'Personal & Family Life',
        description: 'Mga kwento tungkol sa pamilya, personal na karanasan, at sariling buhay',
        englishDescription: 'Stories about family, personal experiences, and personal life',
        backgroundColor: '#E8F5E8', // Soft green
        textColor: '#2D5016',
        backgroundImage: 'family-life.png',
        layoutPosition: { row: 0, column: 0 }
    },
    {
        id: 'cat2',
        numericId: 2,
        name: 'Araw-araw na Pamumuhay',
        englishName: 'Daily Life & Local Culture',
        description: 'Mga karanasan sa pang-araw-araw na buhay at lokal na kultura',
        englishDescription: 'Daily life experiences and local culture',
        backgroundColor: '#FFF4E6', // Warm cream
        textColor: '#8B4513',
        backgroundImage: 'daily-life.png',
        layoutPosition: { row: 0, column: 1 }
    },
    {
        id: 'cat3',
        numericId: 3,
        name: 'Mga kasalukuyang balita',
        englishName: 'News & Current Events',
        description: 'Mga balita, usapang politika, at kasalukuyang mga pangyayari',
        englishDescription: 'News, political discussions, and current events',
        backgroundColor: '#E6F3FF', // Light blue
        textColor: '#1E3A8A',
        backgroundImage: 'news-events.png',
        layoutPosition: { row: 0, column: 2 }
    },
    {
        id: 'cat4',
        numericId: 4,
        name: 'Damdamin at Relasyon',
        englishName: 'Emotional & Relationship Matters',
        description: 'Mga usapang puso, relasyon, at emosyonal na karanasan',
        englishDescription: 'Matters of the heart, relationships, and emotional experiences',
        backgroundColor: '#FFE6F0', // Soft pink
        textColor: '#BE185D',
        backgroundImage: 'relationships.png',
        layoutPosition: { row: 1, column: 0 }
    },
    {
        id: 'cat5',
        numericId: 5,
        name: 'Mga Plano at Pagkakataon',
        englishName: 'Plans & Opportunities',
        description: 'Mga pangarap, plano sa hinaharap, at mga pagkakataon',
        englishDescription: 'Dreams, future plans, and opportunities',
        backgroundColor: '#F0E6FF', // Light purple
        textColor: '#6B21A8',
        backgroundImage: 'plans-opportunities.png',
        layoutPosition: { row: 1, column: 1 }
    },
    {
        id: 'cat6',
        numericId: 6,
        name: 'Libangan at Kasiyahan',
        englishName: 'Entertainment & Fun',
        description: 'Mga libangan, kasiyahan, at masasayang karanasan',
        englishDescription: 'Entertainment, fun, and joyful experiences',
        backgroundColor: '#FFEB3B', // Bright yellow
        textColor: '#8B4513', // Much darker brown for better contrast
        backgroundImage: 'entertainment.png',
        layoutPosition: { row: 1, column: 2 }
    }
];

/**
 * Layout configuration for Filipino-inspired design
 */
export const CATEGORY_LAYOUT_CONFIG: CategoryLayoutConfig = {
    gridRows: 3,
    gridColumns: 3,
    cardSpacing: 20,
    cardBorderRadius: 16,
    filipinoColorScheme: {
        primary: '#8B4513', // Warm brown
        secondary: '#DAA520', // Golden rod
        accent: '#FF6B35', // Warm orange
        warm: [
            '#E8F5E8', // Soft green
            '#FFF4E6', // Warm cream  
            '#E6F3FF', // Light blue
            '#FFE6F0', // Soft pink
            '#F0E6FF', // Light purple
            '#FFEB3B', // Bright yellow
            '#E8E8E8'  // Soft gray
        ]
    }
};

/**
 * Helper functions for category operations
 */
export const getCategoryById = (id: string): FilipinoCategory | undefined => {
    return FILIPINO_CATEGORIES.find(category => category.id === id);
};

export const getCategoryByNumericId = (numericId: number): FilipinoCategory | undefined => {
    return FILIPINO_CATEGORIES.find(category => category.numericId === numericId);
};

export const getAllCategories = (): FilipinoCategory[] => {
    return [...FILIPINO_CATEGORIES];
};

export const getLayoutConfig = (): CategoryLayoutConfig => {
    return { ...CATEGORY_LAYOUT_CONFIG };
};