import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import { BackgroundManager } from '../BackgroundManager';

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockFastImage = React.forwardRef((props: any, ref: any) => {
    const { onLoad, onError, onLoadStart, testID } = props;
    
    React.useEffect(() => {
      if (onLoadStart) onLoadStart();
      
      // Simulate successful load by default
      setTimeout(() => {
        if (props.source?.uri?.includes('error')) {
          if (onError) onError();
        } else {
          if (onLoad) onLoad();
        }
      }, 100);
    }, [props.source?.uri]);
    
    return <View testID={testID} ref={ref} />;
  });
  
  MockFastImage.resizeMode = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'stretch',
    center: 'center',
  };
  
  MockFastImage.priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };
  
  MockFastImage.cacheControl = {
    immutable: 'immutable',
    web: 'web',
    cacheOnly: 'cacheOnly',
  };
  
  return MockFastImage;
});

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return (props: any) => <View {...props} />;
});

describe('BackgroundManager', () => {
  const defaultProps = {
    children: <Text>Test Content</Text>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <BackgroundManager {...defaultProps}>
          <Text>Test Content</Text>
        </BackgroundManager>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('renders with default testID', () => {
      const { getByTestId } = render(<BackgroundManager {...defaultProps} />);
      
      expect(getByTestId('background-manager')).toBeTruthy();
      expect(getByTestId('background-manager-content')).toBeTruthy();
    });

    it('renders with custom testID', () => {
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} testID="custom-background" />
      );
      
      expect(getByTestId('custom-background')).toBeTruthy();
      expect(getByTestId('custom-background-content')).toBeTruthy();
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} style={customStyle} />
      );
      
      const container = getByTestId('background-manager');
      expect(container.props.style).toContainEqual(customStyle);
    });
  });

  describe('Fallback Background', () => {
    it('renders fallback background when no imageUrl provided', () => {
      const { getByTestId } = render(<BackgroundManager {...defaultProps} />);
      
      expect(getByTestId('background-manager-fallback')).toBeTruthy();
    });

    it('uses custom fallback color', () => {
      const fallbackColor = '#ff0000';
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} fallbackColor={fallbackColor} />
      );
      
      const fallback = getByTestId('background-manager-fallback');
      expect(fallback.props.style).toContainEqual({ backgroundColor: fallbackColor });
    });

    it('generates fallback color based on categoryId', () => {
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} categoryId="test-category" />
      );
      
      const fallback = getByTestId('background-manager-fallback');
      const style = Array.isArray(fallback.props.style) 
        ? fallback.props.style.find(s => s && s.backgroundColor)
        : fallback.props.style;
      expect(style?.backgroundColor).toBeDefined();
    });
  });

  describe('Image Loading', () => {
    it('renders FastImage when imageUrl is provided', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} imageUrl={imageUrl} />
      );
      
      expect(getByTestId('background-manager-image')).toBeTruthy();
    });

    it('shows overlay after image loads', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} imageUrl={imageUrl} />
      );
      
      await waitFor(() => {
        expect(getByTestId('background-manager-overlay')).toBeTruthy();
      });
    });

    it('falls back to fallback background on image error', async () => {
      const imageUrl = 'https://example.com/error-image.jpg';
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} imageUrl={imageUrl} />
      );
      
      await waitFor(() => {
        expect(getByTestId('background-manager-fallback')).toBeTruthy();
      });
    });

    it('resets state when imageUrl changes', async () => {
      const { rerender, getByTestId } = render(
        <BackgroundManager {...defaultProps} imageUrl="https://example.com/image1.jpg" />
      );
      
      await waitFor(() => {
        expect(getByTestId('background-manager-overlay')).toBeTruthy();
      });
      
      rerender(
        <BackgroundManager {...defaultProps} imageUrl="https://example.com/image2.jpg" />
      );
      
      // Should still show the image component for new URL
      expect(getByTestId('background-manager-image')).toBeTruthy();
    });
  });

  describe('Overlay Configuration', () => {
    it('uses custom overlay opacity', async () => {
      const overlayOpacity = 0.8;
      const { getByTestId } = render(
        <BackgroundManager 
          {...defaultProps} 
          imageUrl="https://example.com/image.jpg"
          overlayOpacity={overlayOpacity}
        />
      );
      
      await waitFor(() => {
        const overlay = getByTestId('background-manager-overlay');
        expect(overlay.props.style).toContainEqual({ opacity: overlayOpacity });
      });
    });

    it('uses custom overlay colors', async () => {
      const overlayColors = ['rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)'];
      const { getByTestId } = render(
        <BackgroundManager 
          {...defaultProps} 
          imageUrl="https://example.com/image.jpg"
          overlayColors={overlayColors}
        />
      );
      
      await waitFor(() => {
        const overlay = getByTestId('background-manager-overlay');
        expect(overlay.props.colors).toEqual(overlayColors);
      });
    });

    it('auto-adjusts overlay when autoAdjustOverlay is true', async () => {
      const { getByTestId } = render(
        <BackgroundManager 
          {...defaultProps} 
          imageUrl="https://example.com/image.jpg"
          autoAdjustOverlay={true}
        />
      );
      
      await waitFor(() => {
        const overlay = getByTestId('background-manager-overlay');
        expect(overlay.props.colors).toBeDefined();
      });
    });

    it('does not show overlay when image is not loaded and no error', () => {
      const { queryByTestId } = render(
        <BackgroundManager {...defaultProps} imageUrl="https://example.com/image.jpg" />
      );
      
      // Initially, overlay should not be visible
      expect(queryByTestId('background-manager-overlay')).toBeNull();
    });
  });

  describe('FastImage Configuration', () => {
    it('renders FastImage with correct props', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} imageUrl={imageUrl} />
      );
      
      // Check that FastImage component is rendered
      const fastImageElement = getByTestId('background-manager-image');
      expect(fastImageElement).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('handles image load errors gracefully', async () => {
      const imageUrl = 'https://example.com/error-image.jpg';
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} imageUrl={imageUrl} />
      );
      
      await waitFor(() => {
        expect(getByTestId('background-manager-fallback')).toBeTruthy();
      });
    });

    it('shows overlay even when using fallback background', async () => {
      const imageUrl = 'https://example.com/error-image.jpg';
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} imageUrl={imageUrl} />
      );
      
      await waitFor(() => {
        expect(getByTestId('background-manager-overlay')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides appropriate testIDs for testing', () => {
      const testID = 'custom-test-id';
      const { getByTestId } = render(
        <BackgroundManager {...defaultProps} testID={testID} />
      );
      
      expect(getByTestId(testID)).toBeTruthy();
      expect(getByTestId(`${testID}-content`)).toBeTruthy();
      expect(getByTestId(`${testID}-fallback`)).toBeTruthy();
    });
  });
});