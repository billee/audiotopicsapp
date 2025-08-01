/**
 * Category Service - Handles category data loading and management
 */

import { Category } from '../types';

class CategoryService {
  private static instance: CategoryService;
  private categories: Category[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  /**
   * Initialize with mock data for development
   */
  private initializeMockData(): void {
    this.categories = [
      {
        id: '1',
        name: 'Technology',
        description: 'Latest tech trends and innovations',
        iconUrl: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=Tech',
        backgroundImageUrl: 'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Technology',
        topicCount: 15,
        color: '#4A90E2'
      },
      {
        id: '2',
        name: 'Science',
        description: 'Fascinating scientific discoveries',
        iconUrl: 'https://via.placeholder.com/100x100/50C878/FFFFFF?text=Sci',
        backgroundImageUrl: 'https://via.placeholder.com/400x300/50C878/FFFFFF?text=Science',
        topicCount: 12,
        color: '#50C878'
      },
      {
        id: '3',
        name: 'History',
        description: 'Stories from the past',
        iconUrl: 'https://via.placeholder.com/100x100/D2691E/FFFFFF?text=Hist',
        backgroundImageUrl: 'https://via.placeholder.com/400x300/D2691E/FFFFFF?text=History',
        topicCount: 20,
        color: '#D2691E'
      },
      {
        id: '4',
        name: 'Arts & Culture',
        description: 'Creative expressions and cultural insights',
        iconUrl: 'https://via.placeholder.com/100x100/9370DB/FFFFFF?text=Art',
        backgroundImageUrl: 'https://via.placeholder.com/400x300/9370DB/FFFFFF?text=Arts',
        topicCount: 8,
        color: '#9370DB'
      },
      {
        id: '5',
        name: 'Business',
        description: 'Entrepreneurship and business insights',
        iconUrl: 'https://via.placeholder.com/100x100/FF6347/FFFFFF?text=Biz',
        backgroundImageUrl: 'https://via.placeholder.com/400x300/FF6347/FFFFFF?text=Business',
        topicCount: 18,
        color: '#FF6347'
      },
      {
        id: '6',
        name: 'Health & Wellness',
        description: 'Tips for a healthier lifestyle',
        iconUrl: 'https://via.placeholder.com/100x100/32CD32/FFFFFF?text=Health',
        backgroundImageUrl: 'https://via.placeholder.com/400x300/32CD32/FFFFFF?text=Health',
        topicCount: 10,
        color: '#32CD32'
      }
    ];
  }

  /**
   * Get all categories
   */
  public async getCategories(): Promise<Category[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.categories];
  }

  /**
   * Get category by ID
   */
  public async getCategoryById(id: string): Promise<Category | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.categories.find(category => category.id === id) || null;
  }

  /**
   * Search categories by name
   */
  public async searchCategories(query: string): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowercaseQuery = query.toLowerCase();
    return this.categories.filter(category =>
      category.name.toLowerCase().includes(lowercaseQuery) ||
      category.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get categories sorted by topic count
   */
  public async getCategoriesByPopularity(): Promise<Category[]> {
    const categories = await this.getCategories();
    return categories.sort((a, b) => b.topicCount - a.topicCount);
  }
}

export default CategoryService;