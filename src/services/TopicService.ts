/**
 * Topic Service - Handles topic data loading and management
 */

import { AudioTopic } from '../types';

class TopicService {
  private static instance: TopicService;
  private topics: AudioTopic[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): TopicService {
    if (!TopicService.instance) {
      TopicService.instance = new TopicService();
    }
    return TopicService.instance;
  }

  /**
   * Initialize with your custom audio content
   */
  private initializeMockData(): void {
    this.topics = [
      // Technology topics - Replace with your own content
      {
        id: 'tech-1',
        title: 'Your Audio Title 1', // Replace with your title
        description: 'Your audio description goes here. Describe what this audio is about.', // Replace with your description
        categoryId: '1',
        audioUrl: 'file:///android_asset/audio/your-audio-1.wav', // Replace with your .wav file name
        duration: 300, // Replace with actual duration in seconds
        author: 'Your Name', // Replace with your name
        publishDate: '2024-01-15T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Your+Audio',
        metadata: {
          bitrate: 128,
          format: 'wav',
          size: 5000000 // Approximate file size in bytes
        }
      },
      {
        id: 'tech-2',
        title: 'Quantum Computing Explained',
        description: 'A beginner-friendly introduction to quantum computing and its potential applications.',
        categoryId: '1',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 2100, // 35 minutes
        author: 'Prof. Michael Rodriguez',
        publishDate: '2024-01-10T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Quantum',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 33600000
        }
      },
      {
        id: 'tech-3',
        title: 'Blockchain Beyond Cryptocurrency',
        description: 'Discovering practical applications of blockchain technology in various industries.',
        categoryId: '1',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 1650, // 27.5 minutes
        author: 'Alex Thompson',
        publishDate: '2024-01-05T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Blockchain',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 26400000
        }
      },
      // Science topics
      {
        id: 'sci-1',
        title: 'The Mysteries of Dark Matter',
        description: 'Investigating one of the universe\'s greatest unsolved mysteries.',
        categoryId: '2',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        duration: 2400, // 40 minutes
        author: 'Dr. Emily Watson',
        publishDate: '2024-01-20T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/50C878/FFFFFF?text=Dark+Matter',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 38400000
        }
      },
      {
        id: 'sci-2',
        title: 'Climate Change Solutions',
        description: 'Exploring innovative approaches to combat climate change.',
        categoryId: '2',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 1950, // 32.5 minutes
        author: 'Dr. James Green',
        publishDate: '2024-01-18T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/50C878/FFFFFF?text=Climate',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 31200000
        }
      },
      // History topics
      {
        id: 'hist-1',
        title: 'Ancient Civilizations: Lost Cities',
        description: 'Uncovering the secrets of ancient cities that time forgot.',
        categoryId: '3',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        duration: 2700, // 45 minutes
        author: 'Prof. Maria Santos',
        publishDate: '2024-01-12T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/D2691E/FFFFFF?text=Ancient',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 43200000
        }
      },
      {
        id: 'hist-2',
        title: 'World War II: Untold Stories',
        description: 'Personal accounts and lesser-known events from World War II.',
        categoryId: '3',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 3000, // 50 minutes
        author: 'Dr. Robert Miller',
        publishDate: '2024-01-08T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/D2691E/FFFFFF?text=WWII',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 48000000
        }
      },
      // Arts & Culture topics
      {
        id: 'art-1',
        title: 'Renaissance Masters',
        description: 'The lives and works of Leonardo da Vinci, Michelangelo, and Raphael.',
        categoryId: '4',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        duration: 2250, // 37.5 minutes
        author: 'Dr. Isabella Romano',
        publishDate: '2024-01-14T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/9370DB/FFFFFF?text=Renaissance',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 36000000
        }
      },
      // Business topics
      {
        id: 'biz-1',
        title: 'Startup Success Stories',
        description: 'How today\'s tech giants started from humble beginnings.',
        categoryId: '5',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 1800, // 30 minutes
        author: 'Jennifer Lee',
        publishDate: '2024-01-16T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/FF6347/FFFFFF?text=Startups',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 28800000
        }
      },
      {
        id: 'biz-2',
        title: 'Leadership in the Digital Age',
        description: 'Modern leadership strategies for the digital transformation era.',
        categoryId: '5',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        duration: 2100, // 35 minutes
        author: 'David Park',
        publishDate: '2024-01-11T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/FF6347/FFFFFF?text=Leadership',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 33600000
        }
      },
      // Health & Wellness topics
      {
        id: 'health-1',
        title: 'Mindfulness and Mental Health',
        description: 'Practical techniques for managing stress and improving mental well-being.',
        categoryId: '6',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 1500, // 25 minutes
        author: 'Dr. Lisa Chang',
        publishDate: '2024-01-19T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/32CD32/FFFFFF?text=Mindfulness',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 24000000
        }
      },
      {
        id: 'health-2',
        title: 'Nutrition Science Simplified',
        description: 'Evidence-based nutrition advice for optimal health.',
        categoryId: '6',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        duration: 1800, // 30 minutes
        author: 'Dr. Mark Johnson',
        publishDate: '2024-01-13T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/32CD32/FFFFFF?text=Nutrition',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 28800000
        }
      }
    ];
  }

  /**
   * Get all topics
   */
  public async getTopics(): Promise<AudioTopic[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.topics];
  }

  /**
   * Get topics by category ID
   */
  public async getTopicsByCategory(categoryId: string): Promise<AudioTopic[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.topics.filter(topic => topic.categoryId === categoryId);
  }

  /**
   * Get topic by ID
   */
  public async getTopicById(id: string): Promise<AudioTopic | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.topics.find(topic => topic.id === id) || null;
  }

  /**
   * Search topics by title or description
   */
  public async searchTopics(query: string): Promise<AudioTopic[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const lowercaseQuery = query.toLowerCase();
    return this.topics.filter(topic =>
      topic.title.toLowerCase().includes(lowercaseQuery) ||
      topic.description.toLowerCase().includes(lowercaseQuery) ||
      (topic.author && topic.author.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get topics sorted by publish date (newest first)
   */
  public async getTopicsByDate(): Promise<AudioTopic[]> {
    const topics = await this.getTopics();
    return topics.sort((a, b) => {
      const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
      const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
      return dateB - dateA;
    });
  }

  /**
   * Get topics sorted by duration
   */
  public async getTopicsByDuration(ascending: boolean = true): Promise<AudioTopic[]> {
    const topics = await this.getTopics();
    return topics.sort((a, b) => ascending ? a.duration - b.duration : b.duration - a.duration);
  }
}

export default TopicService;