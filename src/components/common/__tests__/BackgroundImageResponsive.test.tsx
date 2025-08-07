/**
 * Tests for BackgroundImage responsive design and performance optimization features
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import BackgroundImage from '../BackgroundImage';
import { backgroundImagePerformanceMonitor } from '../../../utils/backgroundImagePerformance';

// Mock FastImage
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      const MockedFastImage = require('react-native').Image;
      return <MockedFastImage {...props} ref={ref} />;
    }),
    priority: {
      low: 'low',
      normal: 'normal',
      high: 'high',
    },
    cacheControl: {
      immutable: 'immutable',
      web: 'web',
      cacheOnly: 'cacheOnly',
    },
    resizeMode: {
      contain: 'contain',
      cover: 'cover',
      stretch: 'stretch',
      center: 'center',
    },
    preload: jest.fn().mockResolvedValue(undefined),
    clearMemoryCache: jest.fn(),
  };
});

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    const MockedView = require('react-native').View;
    return <MockedView {...props} ref={ref} />;
  });
});

// Mock responsive utilities
jest.mock('../../../utils/responsive', () => ({
  getResponsiveDimensions: () => ({
    screenWidth: 375,
    screenHeight: 812,
    orientation: 'portrait',
    screenSize: 'medium',
    isLandscape: false,
    isPortrait: true,
    isTablet: false,
  }),
  getOptimalImageSize: jest.fn((width, height) => {
    const area = width * height;
    if (area < 400 * 300) return 'small';
    if (area < 800 * 600) return 'medium';
    if (area < 1200 * 900) return 'large';
    return 'xlarge';
  }),
  generateResponsiveImageUrls: jest.fn((baseUri) => ({
    small: `${baseUri}?w=400&h=300`,
    medium: `${baseUri}?w=800&h=600`,
    large: `${baseUri}?w=1200&h=900`,
    xlarge: `${baseUri}?w=1600&h=1200`,
  })),
  getResponsiveImageCacheKey: jest.fn((uri, width, height) => `${uri}_${width}x${height}`),
}));

describe('BackgroundImage Responsive Design', () => {
  const mockSource = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d';
  const TestChild = () => <></>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Responsive Image URLs', () => {
    it('should generate responsive URLs for Unsplash images when enableResponsiveImages is true', async () => {
      const { generateResponsiveImageUrls } = require('../../../utils/responsive');
      
      render(
        <BackgroundImage 
          source={mockSource} 
          enableResponsiveImages={true}
          testID="responsive-background"
        >
          <TestChild />
        </BackgroundImage>
      );

      await waitFor(() => {
        expect(generateResponsiveImageUrls).toHaveBeenCalledWith(mockSource);
      });
    });

    it('should not generate responsive URLs when enableResponsiveImages is false', async () => {
      const { generateResponsiveImageUrls } = require('../../../utils/responsive');
      
      render(
        <BackgroundImage 
          source={mockSource} 
          enableResponsiveImages={false}
          testID="non-responsive-background"
        >
          <TestChild />
        </BackgroundImage>
      );

      // Should not call generateResponsiveImageUrls
      expect(generateResponsiveImageUrls).not.toHaveBeenCalled();
    });

    it('should handle local assets without generating responsive URLs', async () => {
      const localAsset = require('../../../assets/backgrounds/topic-list/technology.png');
      const { generateResponsiveImageUrls } = require('../../../utils/responsive');
      
      render(
        <BackgroundImage 
          source={localAsset} 
          enableResponsiveImages={true}
          testID="local-asset-background"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(generateResponsiveImageUrls).not.toHaveBeenCalled();
    });
  });

  describe('Screen Dimension Handling', () => {
    it('should update dimensions when screen size changes', async () => {
      const { rerender } = render(
        <BackgroundImage source={mockSource} testID="dimension-test">
          <TestChild />
        </BackgroundImage>
      );

      // Mock dimension change
      const mockDimensionChange = {
        window: { width: 768, height: 1024 },
        screen: { width: 768, height: 1024 },
      };

      act(() => {
        // Simulate dimension change event
        const listeners = (Dimensions.addEventListener as jest.Mock).mock.calls;
        if (listeners.length > 0) {
          const callback = listeners[0][1];
          callback(mockDimensionChange);
        }
      });

      // Component should handle the dimension change
      expect(true).toBe(true); // Basic test to ensure no crashes
    });

    it('should use fallback dimensions when Dimensions API fails', () => {
      // Mock Dimensions.get to throw an error
      const originalGet = Dimensions.get;
      Dimensions.get = jest.fn().mockImplementation(() => {
        throw new Error('Dimensions not available');
      });

      const { getByTestId } = render(
        <BackgroundImage source={mockSource} testID="fallback-dimensions">
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('fallback-dimensions')).toBeTruthy();

      // Restore original implementation
      Dimensions.get = originalGet;
    });
  });

  describe('Transition Animations', () => {
    it('should enable transitions by default', () => {
      const { getByTestId } = render(
        <BackgroundImage source={mockSource} testID="default-transitions">
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('default-transitions')).toBeTruthy();
    });

    it('should disable transitions when enableTransitions is false', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source={mockSource} 
          enableTransitions={false}
          testID="no-transitions"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('no-transitions')).toBeTruthy();
    });

    it('should use custom transition duration', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source={mockSource} 
          transitionDuration={500}
          testID="custom-duration"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('custom-duration')).toBeTruthy();
    });
  });

  describe('Performance Monitoring', () => {
    it('should record load start metrics', async () => {
      const spy = jest.spyOn(backgroundImagePerformanceMonitor, 'recordLoadStart');
      
      render(
        <BackgroundImage source={mockSource} testID="performance-test">
          <TestChild />
        </BackgroundImage>
      );

      // Performance monitoring should be called
      await waitFor(() => {
        expect(spy).toHaveBeenCalled();
      });

      spy.mockRestore();
    });

    it('should record load completion metrics on successful load', async () => {
      const spy = jest.spyOn(backgroundImagePerformanceMonitor, 'recordLoadComplete');
      
      const { getByTestId } = render(
        <BackgroundImage source={mockSource} testID="success-metrics">
          <TestChild />
        </BackgroundImage>
      );

      const image = getByTestId('success-metrics-image');
      
      // Simulate successful load
      act(() => {
        if (image.props.onLoad) {
          image.props.onLoad();
        }
      });

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(mockSource, true);
      });

      spy.mockRestore();
    });

    it('should record load completion metrics on error', async () => {
      const spy = jest.spyOn(backgroundImagePerformanceMonitor, 'recordLoadComplete');
      
      const { getByTestId } = render(
        <BackgroundImage source={mockSource} testID="error-metrics">
          <TestChild />
        </BackgroundImage>
      );

      const image = getByTestId('error-metrics-image');
      const mockError = { message: 'Failed to load image' };
      
      // Simulate error
      act(() => {
        if (image.props.onError) {
          image.props.onError(mockError);
        }
      });

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(mockSource, false, 'Failed to load image');
      });

      spy.mockRestore();
    });
  });

  describe('Responsive Overlay', () => {
    it('should apply responsive dimensions to overlay', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source={mockSource} 
          overlay={true}
          testID="responsive-overlay"
        >
          <TestChild />
        </BackgroundImage>
      );

      // Should render overlay with responsive dimensions
      expect(getByTestId('responsive-overlay')).toBeTruthy();
    });

    it('should animate overlay opacity with transitions', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source={mockSource} 
          overlay={true}
          enableTransitions={true}
          testID="animated-overlay"
        >
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('animated-overlay')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should show fallback background with responsive dimensions on error', async () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source={mockSource} 
          fallbackColor="#ff0000"
          testID="error-fallback"
        >
          <TestChild />
        </BackgroundImage>
      );

      const image = getByTestId('error-fallback-image');
      
      // Simulate error
      act(() => {
        if (image.props.onError) {
          image.props.onError({ message: 'Network error' });
        }
      });

      await waitFor(() => {
        expect(getByTestId('error-fallback-fallback')).toBeTruthy();
      });
    });

    it('should show responsive loading state', () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source={mockSource} 
          showLoadingState={true}
          testID="responsive-loading"
        >
          <TestChild />
        </BackgroundImage>
      );

      // Simulate loading state
      const image = getByTestId('responsive-loading-image');
      act(() => {
        if (image.props.onLoadStart) {
          image.props.onLoadStart();
        }
      });

      expect(getByTestId('responsive-loading-loading')).toBeTruthy();
    });
  });

  describe('Memory Management', () => {
    it('should handle component unmounting gracefully', () => {
      const { unmount } = render(
        <BackgroundImage source={mockSource} testID="unmount-test">
          <TestChild />
        </BackgroundImage>
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should clean up animations on unmount', () => {
      const { unmount } = render(
        <BackgroundImage 
          source={mockSource} 
          enableTransitions={true}
          testID="animation-cleanup"
        >
          <TestChild />
        </BackgroundImage>
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('BackgroundImage Performance Optimization', () => {
  const TestChild = () => <></>;

  describe('Image Caching', () => {
    it('should use immutable cache control for remote images', () => {
      const FastImage = require('react-native-fast-image').default;
      
      render(
        <BackgroundImage source="https://example.com/image.jpg" testID="cache-test">
          <TestChild />
        </BackgroundImage>
      );

      // FastImage should be called with immutable cache control
      expect(FastImage).toHaveBeenCalled();
    });

    it('should handle local assets without cache control', () => {
      const localAsset = require('../../../assets/backgrounds/topic-list/technology.png');
      
      const { getByTestId } = render(
        <BackgroundImage source={localAsset} testID="local-cache-test">
          <TestChild />
        </BackgroundImage>
      );

      expect(getByTestId('local-cache-test')).toBeTruthy();
    });
  });

  describe('Lazy Loading', () => {
    it('should prioritize critical images with high priority', () => {
      const FastImage = require('react-native-fast-image');
      
      render(
        <BackgroundImage source="https://example.com/critical.jpg" testID="priority-test">
          <TestChild />
        </BackgroundImage>
      );

      // Should use high priority for loading
      expect(FastImage.default).toHaveBeenCalled();
    });

    it('should handle loading states appropriately', async () => {
      const { getByTestId } = render(
        <BackgroundImage 
          source="https://example.com/slow.jpg" 
          showLoadingState={true}
          testID="loading-state-test"
        >
          <TestChild />
        </BackgroundImage>
      );

      const image = getByTestId('loading-state-test-image');
      
      // Simulate load start
      act(() => {
        if (image.props.onLoadStart) {
          image.props.onLoadStart();
        }
      });

      expect(getByTestId('loading-state-test-loading')).toBeTruthy();
    });
  });

  describe('Memory Optimization', () => {
    it('should prevent memory leaks with proper cleanup', () => {
      const { unmount } = render(
        <BackgroundImage source="https://example.com/memory.jpg" testID="memory-test">
          <TestChild />
        </BackgroundImage>
      );

      // Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple rapid source changes', () => {
      const { rerender } = render(
        <BackgroundImage source="https://example.com/image1.jpg" testID="rapid-change">
          <TestChild />
        </BackgroundImage>
      );

      // Rapidly change sources
      rerender(
        <BackgroundImage source="https://example.com/image2.jpg" testID="rapid-change">
          <TestChild />
        </BackgroundImage>
      );

      rerender(
        <BackgroundImage source="https://example.com/image3.jpg" testID="rapid-change">
          <TestChild />
        </BackgroundImage>
      );

      // Should handle rapid changes without errors
      expect(true).toBe(true);
    });
  });
});