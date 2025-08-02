/**
 * Tests for useOrientation hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { Dimensions } from 'react-native';
import { useOrientation, useResponsiveStyles } from '../useOrientation';

// Mock Dimensions
const mockDimensions = {
  get: jest.fn(),
  addEventListener: jest.fn(),
};

jest.mock('react-native', () => ({
  Dimensions: mockDimensions,
}));

describe('useOrientation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return portrait orientation for portrait dimensions', () => {
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useOrientation());

    expect(result.current.orientation).toBe('portrait');
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });

  it('should return landscape orientation for landscape dimensions', () => {
    mockDimensions.get.mockReturnValue({ width: 812, height: 375 });
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useOrientation());

    expect(result.current.orientation).toBe('landscape');
    expect(result.current.isPortrait).toBe(false);
    expect(result.current.isLandscape).toBe(true);
  });

  it('should detect tablet devices', () => {
    mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useOrientation());

    expect(result.current.isTablet).toBe(true);
  });

  it('should update orientation when dimensions change', () => {
    const mockRemove = jest.fn();
    const mockAddEventListener = jest.fn().mockReturnValue({ remove: mockRemove });
    mockDimensions.addEventListener = mockAddEventListener;
    
    // Start with portrait
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

    const { result } = renderHook(() => useOrientation());

    expect(result.current.orientation).toBe('portrait');

    // Simulate orientation change to landscape
    act(() => {
      const changeHandler = mockAddEventListener.mock.calls[0][1];
      mockDimensions.get.mockReturnValue({ width: 812, height: 375 });
      changeHandler({ window: { width: 812, height: 375 } });
    });

    expect(result.current.orientation).toBe('landscape');
  });

  it('should provide correct screen size categories', () => {
    // Small screen
    mockDimensions.get.mockReturnValue({ width: 320, height: 568 });
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });

    const { result: smallResult } = renderHook(() => useOrientation());
    expect(smallResult.current.screenSize).toBe('small');

    // Medium screen
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
    const { result: mediumResult } = renderHook(() => useOrientation());
    expect(mediumResult.current.screenSize).toBe('medium');

    // Large screen
    mockDimensions.get.mockReturnValue({ width: 428, height: 926 });
    const { result: largeResult } = renderHook(() => useOrientation());
    expect(largeResult.current.screenSize).toBe('large');
  });

  it('should provide layout configuration', () => {
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useOrientation());

    expect(result.current.layoutConfig).toBeDefined();
    expect(result.current.layoutConfig.audioPlayer).toBeDefined();
    expect(result.current.layoutConfig.categoryGrid).toBeDefined();
    expect(result.current.layoutConfig.topicList).toBeDefined();
  });
});

describe('useResponsiveStyles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide responsive style helpers', () => {
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useResponsiveStyles());

    expect(result.current.getResponsiveStyle).toBeInstanceOf(Function);
    expect(result.current.getTabletStyle).toBeInstanceOf(Function);
    expect(result.current.getScreenSizeStyle).toBeInstanceOf(Function);
  });

  it('should return correct styles based on orientation', () => {
    mockDimensions.get.mockReturnValue({ width: 812, height: 375 }); // Landscape
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useResponsiveStyles());

    const portraitStyle = { padding: 20 };
    const landscapeStyle = { padding: 10 };

    const selectedStyle = result.current.getResponsiveStyle(portraitStyle, landscapeStyle);
    expect(selectedStyle).toEqual(landscapeStyle);
  });

  it('should return correct styles based on device type', () => {
    mockDimensions.get.mockReturnValue({ width: 768, height: 1024 }); // Tablet
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useResponsiveStyles());

    const phoneStyle = { fontSize: 16 };
    const tabletStyle = { fontSize: 18 };

    const selectedStyle = result.current.getTabletStyle(phoneStyle, tabletStyle);
    expect(selectedStyle).toEqual(tabletStyle);
  });

  it('should return correct styles based on screen size', () => {
    mockDimensions.get.mockReturnValue({ width: 320, height: 568 }); // Small
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useResponsiveStyles());

    const styles = {
      small: { padding: 8 },
      medium: { padding: 16 },
      large: { padding: 24 },
    };

    const selectedStyle = result.current.getScreenSizeStyle(styles);
    expect(selectedStyle).toEqual(styles.small);
  });
});