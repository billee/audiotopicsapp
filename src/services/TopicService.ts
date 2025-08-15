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
      // Pamilya at Sariling Buhay topics
      {
        id: 'topic1',
        title: 'Mga Balitang Pang-ekonomiya ngayong Linggo',
        description: 'Weekly economic news and updates affecting families and personal finances.',
        categoryId: 'cat1',
        audioUrl: 'https://raw.githubusercontent.com/billee/audiotopicsapp/main/android/app/src/main/assets/audio/ElevenLabs_Sarah.mp3',
        duration: 180, // 3 minutes - adjust based on actual file duration
        author: 'Sarah',
        publishDate: '2024-01-15T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/E8F5E8/2D5016?text=Economic+News',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 2880000 // Approximate file size for 3 minutes of MP3
        }
      },
      {
        id: 'topic2',
        title: 'Family Stories',
        description: 'Personal stories about family relationships and experiences.',
        categoryId: 'cat1',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 2100, // 35 minutes
        author: 'Maria Santos',
        publishDate: '2024-01-10T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/E8F5E8/2D5016?text=Family',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 33600000
        }
      },
      // Araw-araw na Pamumuhay topics
      {
        id: 'topic3',
        title: 'Ang Krisis sa Klima',
        description: 'Base sa Ehipto.',
        categoryId: 'cat2',
        audioUrl: 'https://raw.githubusercontent.com/billee/audiotopicsapp/main/android/app/src/main/assets/audio/ang_krisis_sa_klima_tugon_ng_ehipto.mp3',
        duration: 360, // 6 minutes
        author: 'Joe S',
        publishDate: '2024-01-20T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/FFF4E6/8B4513?text=Krisis+sa+Klima',
        metadata: {
          bitrate: 128,
          format: 'wav',
          size: 5760000 // Approximate size for 6 minutes of WAV audio
        }
      },
      {
        id: 'topic4',
        title: 'Daily Life Stories',
        description: 'Stories about everyday experiences and local culture.',
        categoryId: 'cat2',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 1950, // 32.5 minutes
        author: 'Juan Dela Cruz',
        publishDate: '2024-01-18T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/FFF4E6/8B4513?text=Daily+Life',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 31200000
        }
      },
      // Mga kasalukuyang balita topics
      {
        id: 'topic5',
        title: 'Current Events Discussion',
        description: 'Discussion about current news and political events.',
        categoryId: 'cat3',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        duration: 2700, // 45 minutes
        author: 'News Reporter',
        publishDate: '2024-01-12T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/E6F3FF/1E3A8A?text=News',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 43200000
        }
      },
      // Damdamin at Relasyon topics
      {
        id: 'topic6',
        title: 'Love and Relationships',
        description: 'Stories about love, relationships, and emotional experiences.',
        categoryId: 'cat4',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        duration: 2250, // 37.5 minutes
        author: 'Relationship Expert',
        publishDate: '2024-01-14T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/FFE6F0/BE185D?text=Love',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 36000000
        }
      },
      // Mga Plano at Pagkakataon topics
      {
        id: 'topic7',
        title: 'Future Plans and Dreams',
        description: 'Stories about dreams, future plans, and opportunities.',
        categoryId: 'cat5',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 1800, // 30 minutes
        author: 'Life Coach',
        publishDate: '2024-01-16T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/F0E6FF/6B21A8?text=Dreams',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 28800000
        }
      },
      // Libangan at Kasiyahan topics
      {
        id: 'topic8',
        title: 'Entertainment Stories',
        description: 'Fun and entertaining stories for enjoyment.',
        categoryId: 'cat6',
        audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 1500, // 25 minutes
        author: 'Entertainer',
        publishDate: '2024-01-19T00:00:00.000Z',
        thumbnailUrl: 'https://via.placeholder.com/300x200/FFEB3B/8B4513?text=Fun',
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 24000000
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