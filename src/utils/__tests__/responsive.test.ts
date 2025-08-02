/**
 * Tests for responsive utilities
 */

import { Dimensions } from 'react-native';
import {
  getScreenSize,
  getOrientation,
  isLandscape,
  isPortrait,
  isTablet,
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveBorderRadius,
  getGridColumns,
  getResponsiveDimensions,
  getLayoutConfig,
  SCREEN_SIZES,
  ORIENTATIONS,
} from '../responsive';

// Mock Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(),
  },
  PixelRatio: {
    roundToNearestPixel: jest.fn((value) => Math.round(value)),
  },
}));

const mockDimensions = Dimensions as jest.Mocked<typeof Dimensions>;

describe('Responsive Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Size Detection', () => {
    it('should detect small screen size', () => {
      mockDimensions.get.mockReturnValue({ width: 320, height: 568 });
      expect(getScreenSize()).toBe(SCREEN_SIZES.SMALL);
    });

    it('should detect medium screen size', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      expect(getScreenSize()).toBe(SCREEN_SIZES.MEDIUM);
    });

    it('should detect large screen size', () => {
      mockDimensions.get.mockReturnValue({ width: 428, height: 926 });
      expect(getScreenSize()).toBe(SCREEN_SIZES.LARGE);
    });
  });

  describe('Orientation Detection', () => {
    it('should detect portrait orientation', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      expect(getOrientation()).toBe(ORIENTATIONS.PORTRAIT);
      expect(isPortrait()).toBe(true);
      expect(isLandscape()).toBe(false);
    });

    it('should detect landscape orientation', () => {
      mockDimensions.get.mockReturnValue({ width: 812, height: 375 });
      expect(getOrientation()).toBe(ORIENTATIONS.LANDSCAPE);
      expect(isPortrait()).toBe(false);
      expect(isLandscape()).toBe(true);
    });
  });

  describe('Device Type Detection', () => {
    it('should detect tablet by width', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 600 });
      expect(isTablet()).toBe(true);
    });

    it('should detect tablet by height', () => {
      mockDimensions.get.mockReturnValue({ width: 600, height: 1024 });
      expect(isTablet()).toBe(true);
    });

    it('should detect phone', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      expect(isTablet()).toBe(false);
    });
  });

  describe('Scaling Functions', () => {
    beforeEach(() => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
    });

    it('should scale width correctly', () => {
      const scaled = scaleWidth(100);
      expect(scaled).toBe(100); // 375/375 * 100 = 100
    });

    it('should scale height correctly', () => {
      const scaled = scaleHeight(100);
      expect(scaled).toBeCloseTo(100); // 812/812 * 100 = 100
    });

    it('should scale font size correctly', () => {
      const scaled = scaleFontSize(16);
      expect(scaled).toBeGreaterThan(0);
      expect(typeof scaled).toBe('number');
    });
  });

  describe('Responsive Values', () => {
    it('should provide responsive padding for small screens', () => {
      mockDimensions.get.mockReturnValue({ width: 320, height: 568 });
      const padding = getResponsivePadding(16);
      expect(padding).toBe(12.8); // 16 * 0.8
    });

    it('should provide responsive padding for medium screens', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      const padding = getResponsivePadding(16);
      expect(padding).toBe(16);
    });

    it('should provide responsive padding for large screens', () => {
      mockDimensions.get.mockReturnValue({ width: 428, height: 926 });
      const padding = getResponsivePadding(16);
      expect(padding).toBe(19.2); // 16 * 1.2
    });

    it('should provide responsive margin', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      const margin = getResponsiveMargin(8);
      expect(margin).toBe(8);
    });

    it('should provide responsive border radius', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      const radius = getResponsiveBorderRadius(8);
      expect(radius).toBe(8);
    });
  });

  describe('Grid Columns', () => {
    it('should return correct columns for portrait phone', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      const columns = getGridColumns(2);
      expect(columns).toBe(2);
    });

    it('should return more columns for landscape phone', () => {
      mockDimensions.get.mockReturnValue({ width: 812, height: 375 });
      const columns = getGridColumns(2);
      expect(columns).toBe(3);
    });

    it('should return more columns for tablet', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });
      const columns = getGridColumns(2);
      expect(columns).toBe(3); // Portrait tablet
    });

    it('should return even more columns for landscape tablet', () => {
      mockDimensions.get.mockReturnValue({ width: 1024, height: 768 });
      const columns = getGridColumns(2);
      expect(columns).toBe(4); // Landscape tablet
    });
  });

  describe('Responsive Dimensions', () => {
    it('should provide complete responsive dimensions object', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      const dimensions = getResponsiveDimensions();

      expect(dimensions).toHaveProperty('screenWidth', 375);
      expect(dimensions).toHaveProperty('screenHeight', 812);
      expect(dimensions).toHaveProperty('orientation', ORIENTATIONS.PORTRAIT);
      expect(dimensions).toHaveProperty('screenSize', SCREEN_SIZES.MEDIUM);
      expect(dimensions).toHaveProperty('isLandscape', false);
      expect(dimensions).toHaveProperty('isPortrait', true);
      expect(dimensions).toHaveProperty('isTablet', false);
      expect(dimensions).toHaveProperty('safeAreaPadding');
      expect(dimensions).toHaveProperty('contentPadding');
      expect(dimensions).toHaveProperty('gridColumns');
    });
  });

  describe('Layout Configuration', () => {
    it('should provide layout config for portrait', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
      const config = getLayoutConfig();

      expect(config.audioPlayer).toBeDefined();
      expect(config.categoryGrid).toBeDefined();
      expect(config.topicList).toBeDefined();

      expect(config.audioPlayer.compactLayout).toBe(false);
      expect(config.topicList.compactMode).toBe(false);
    });

    it('should provide layout config for landscape phone', () => {
      mockDimensions.get.mockReturnValue({ width: 812, height: 375 });
      const config = getLayoutConfig();

      expect(config.audioPlayer.compactLayout).toBe(true);
      expect(config.topicList.compactMode).toBe(true);
    });

    it('should provide layout config for tablet', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });
      const config = getLayoutConfig();

      expect(config.audioPlayer.showVolumeControl).toBe(true);
      expect(config.topicList.showThumbnails).toBe(true);
    });
  });
});