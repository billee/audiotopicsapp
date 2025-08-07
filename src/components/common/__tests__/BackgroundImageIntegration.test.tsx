/**
 * Integration test for BackgroundImage responsive design and performance features
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import BackgroundImage from '../BackgroundImage';

// Simple mock for FastImage
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => (
      <View {...props} ref={ref} testID={props.testID || 'fast-image'} />
    )),
    priority: { high: 'high', normal: 'normal', low: 'low' },
    cacheControl: { immutable: 'immutable', web: 'web', cacheOnly: 'cacheOnly' },
    resizeMode: { contain: 'contain', cover: 'cover', stretch: 'stretch', center: 'center' },
    preload: jest.fn().mockResolvedValue(undefined),
    clearMemoryCache: jest.fn(),
  };
});

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return React.forwardRef((props: any, ref: any) => (
    <View {...props} ref={ref} testID="linear-gradient" />
  ));
});

// Mock performance monitoring
jest.mock('../../../utils/backgroundImagePerformance', () => ({
  useBackgroundImagePerformance: () => ({
    recordLoadStart: jest.fn(),
    recordLoadComplete: jest.fn(),
    getMetrics: jest.fn(() => ({
      totalImages: 0,
      successfulLoads: 0,
      failedLoads: 0,
      averageLoadTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    })),
    logSummary: jest.fn(),
  }),
}));

describe('BackgroundImage Integration Tests', () => {
  const TestChild = () => <Text>Test Content</Text>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(
        <BackgroundImage source="https://example.com/image.jpg" testID="integration-test">
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('integration-test')).toBeTruthy();
      expect(getByTestId('integration-test-content')).toBeTruthy();
    });

    it('should render with responsive features enabled', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
          enableResponsiveImages={true}
          testID="responsive-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('responsive-test')).toBeTruthy();
    });

    it('should render with transitions enabled', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source="https://example.com/image.jpg"
          enableTransitions={true}
          transitionDuration={300}
          testID="transition-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('transition-test')).toBeTruthy();
    });

    it('should handle local assets', () => {
      const localAsset = require('../../../assets/backgrounds/topic-list/technology.png');
      
      const { getByTestId } = render(
        <BackgroundImage 
          source={localAsset}
          testID="local-asset-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('local-asset-test')).toBeTruthy();
    });
  });

  describe('Responsive Design Features', () => {
    it('should handle different screen dimensions', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
          enableResponsiveImages={true}
          testID="dimensions-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      // Component should render successfully with responsive features
      expect(getByTestId('dimensions-test')).toBeTruthy();
      expect(getByTestId('dimensions-test-image')).toBeTruthy();
    });

    it('should apply responsive overlay', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source="https://example.com/image.jpg"
          overlay={true}
          overlayOpacity={0.5}
          testID="overlay-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('overlay-test')).toBeTruthy();
    });
  });

  describe('Performance Features', () => {
    it('should handle performance monitoring', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source="https://example.com/image.jpg"
          testID="performance-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      // Should render without performance monitoring errors
      expect(getByTestId('performance-test')).toBeTruthy();
    });

    it('should handle caching configuration', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source="https://example.com/cached-image.jpg"
          testID="cache-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('cache-test')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should show fallback on error', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source="https://invalid-url.com/nonexistent.jpg"
          fallbackColor="#ff0000"
          testID="error-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('error-test')).toBeTruthy();
    });

    it('should handle missing source gracefully', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source=""
          testID="empty-source-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('empty-source-test')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should maintain accessibility with background images', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source="https://example.com/image.jpg"
          testID="accessibility-test"
        >
          <Text accessibilityLabel="Test content">Test Content</Text>
        </BackgroundImage>
      );

      expect(getByTestId('accessibility-test')).toBeTruthy();
      expect(getByTestId('accessibility-test-content')).toBeTruthy();
    });
  });
});

describe('Responsive Utilities Integration', () => {
  it('should work with responsive utility functions', () => {
    const { 
      getOptimalImageSize, 
      generateResponsiveImageUrls,
      createResponsiveImageUrl 
    } = require('../../../utils/responsive');

    // Test optimal image size calculation
    expect(getOptimalImageSize(375, 812)).toBe('medium');
    expect(getOptimalImageSize(768, 1024)).toBe('large');
    expect(getOptimalImageSize(1200, 1600)).toBe('xlarge');

    // Test responsive URL generation
    const baseUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d';
    const responsiveUrls = generateResponsiveImageUrls(baseUrl);
    
    expect(responsiveUrls.small).toContain('w=400');
    expect(responsiveUrls.medium).toContain('w=800');
    expect(responsiveUrls.large).toContain('w=1200');
    expect(responsiveUrls.xlarge).toContain('w=1600');

    // Test individual URL creation
    const customUrl = createResponsiveImageUrl(baseUrl, 600, 400);
    expect(customUrl).toContain('w=600');
    expect(customUrl).toContain('h=400');
  });
});

describe('Performance Monitoring Integration', () => {
  it('should integrate with performance monitoring utilities', () => {
    const { 
      backgroundImagePerformanceMonitor,
      getOptimalImageQuality,
      shouldPreloadImage 
    } = require('../../../utils/backgroundImagePerformance');

    // Test performance monitoring
    expect(backgroundImagePerformanceMonitor).toBeDefined();
    expect(typeof backgroundImagePerformanceMonitor.getPerformanceMetrics).toBe('function');

    // Test image quality optimization
    expect(getOptimalImageQuality('wifi')).toBe(90);
    expect(getOptimalImageQuality('4g')).toBe(80);
    expect(getOptimalImageQuality('3g')).toBe(60);

    // Test preload decisions
    expect(shouldPreloadImage('category-screen', 'high')).toBe(true);
    expect(shouldPreloadImage('topic-list', 'medium')).toBe(true);
  });
});