/**
 * Responsive design utilities for handling different screen sizes and orientations
 */

import { Dimensions, PixelRatio } from 'react-native';

// Get screen dimensions - with fallback for testing
let SCREEN_WIDTH = 375;
let SCREEN_HEIGHT = 812;

try {
  const dimensions = Dimensions.get('window');
  SCREEN_WIDTH = dimensions.width;
  SCREEN_HEIGHT = dimensions.height;
} catch (error) {
  // Fallback for testing environment
  console.warn('Dimensions not available, using fallback values');
}

// Base dimensions for scaling (iPhone 11 Pro dimensions)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Screen size categories
 */
export const SCREEN_SIZES = {
  SMALL: 'small',   // < 375px width
  MEDIUM: 'medium', // 375px - 414px width
  LARGE: 'large',   // > 414px width
} as const;

export type ScreenSize = typeof SCREEN_SIZES[keyof typeof SCREEN_SIZES];

/**
 * Device orientations
 */
export const ORIENTATIONS = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
} as const;

export type Orientation = typeof ORIENTATIONS[keyof typeof ORIENTATIONS];

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  SMALL_WIDTH: 375,
  MEDIUM_WIDTH: 414,
  TABLET_WIDTH: 768,
  TABLET_HEIGHT: 1024,
} as const;

/**
 * Get current screen size category
 */
export const getScreenSize = (): ScreenSize => {
  let width = SCREEN_WIDTH;
  
  try {
    width = Dimensions.get('window').width;
  } catch (error) {
    // Use fallback width
  }
  
  if (width < BREAKPOINTS.SMALL_WIDTH) {
    return SCREEN_SIZES.SMALL;
  } else if (width <= BREAKPOINTS.MEDIUM_WIDTH) {
    return SCREEN_SIZES.MEDIUM;
  } else {
    return SCREEN_SIZES.LARGE;
  }
};

/**
 * Get current orientation
 */
export const getOrientation = (): Orientation => {
  let width = SCREEN_WIDTH;
  let height = SCREEN_HEIGHT;
  
  try {
    const dimensions = Dimensions.get('window');
    width = dimensions.width;
    height = dimensions.height;
  } catch (error) {
    // Use fallback dimensions
  }
  
  return width > height ? ORIENTATIONS.LANDSCAPE : ORIENTATIONS.PORTRAIT;
};

/**
 * Check if device is in landscape mode
 */
export const isLandscape = (): boolean => {
  return getOrientation() === ORIENTATIONS.LANDSCAPE;
};

/**
 * Check if device is in portrait mode
 */
export const isPortrait = (): boolean => {
  return getOrientation() === ORIENTATIONS.PORTRAIT;
};

/**
 * Check if device is a tablet
 */
export const isTablet = (): boolean => {
  let width = SCREEN_WIDTH;
  let height = SCREEN_HEIGHT;
  
  try {
    const dimensions = Dimensions.get('window');
    width = dimensions.width;
    height = dimensions.height;
  } catch (error) {
    // Use fallback dimensions
  }
  
  return width >= BREAKPOINTS.TABLET_WIDTH || height >= BREAKPOINTS.TABLET_HEIGHT;
};

/**
 * Scale value based on screen width
 */
export const scaleWidth = (size: number): number => {
  let width = SCREEN_WIDTH;
  
  try {
    width = Dimensions.get('window').width;
  } catch (error) {
    // Use fallback width
  }
  
  return (width / BASE_WIDTH) * size;
};

/**
 * Scale value based on screen height
 */
export const scaleHeight = (size: number): number => {
  let height = SCREEN_HEIGHT;
  
  try {
    height = Dimensions.get('window').height;
  } catch (error) {
    // Use fallback height
  }
  
  return (height / BASE_HEIGHT) * size;
};

/**
 * Scale font size based on screen size and pixel density
 */
export const scaleFontSize = (size: number): number => {
  let width = SCREEN_WIDTH;
  let height = SCREEN_HEIGHT;
  
  try {
    const dimensions = Dimensions.get('window');
    width = dimensions.width;
    height = dimensions.height;
  } catch (error) {
    // Use fallback dimensions
  }
  
  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
  const newSize = size * scale;
  
  try {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } catch (error) {
    return Math.round(newSize);
  }
};

/**
 * Get responsive padding based on screen size
 */
export const getResponsivePadding = (base: number = 16): number => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      return base * 0.8;
    case SCREEN_SIZES.MEDIUM:
      return base;
    case SCREEN_SIZES.LARGE:
      return base * 1.2;
    default:
      return base;
  }
};

/**
 * Get responsive margin based on screen size
 */
export const getResponsiveMargin = (base: number = 8): number => {
  return getResponsivePadding(base);
};

/**
 * Get responsive border radius based on screen size
 */
export const getResponsiveBorderRadius = (base: number = 8): number => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      return base * 0.8;
    case SCREEN_SIZES.MEDIUM:
      return base;
    case SCREEN_SIZES.LARGE:
      return base * 1.1;
    default:
      return base;
  }
};

/**
 * Get grid columns based on screen size and orientation
 */
export const getGridColumns = (baseColumns: number = 2): number => {
  const screenSize = getScreenSize();
  const orientation = getOrientation();
  
  if (isTablet()) {
    return orientation === ORIENTATIONS.LANDSCAPE ? baseColumns + 2 : baseColumns + 1;
  }
  
  if (orientation === ORIENTATIONS.LANDSCAPE) {
    return baseColumns + 1;
  }
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      return Math.max(1, baseColumns - 1);
    case SCREEN_SIZES.MEDIUM:
      return baseColumns;
    case SCREEN_SIZES.LARGE:
      return baseColumns + 1;
    default:
      return baseColumns;
  }
};

/**
 * Get responsive dimensions for components
 */
export const getResponsiveDimensions = () => {
  let width = SCREEN_WIDTH;
  let height = SCREEN_HEIGHT;
  
  try {
    const dimensions = Dimensions.get('window');
    width = dimensions.width;
    height = dimensions.height;
  } catch (error) {
    // Use fallback dimensions
  }
  
  const orientation = getOrientation();
  const screenSize = getScreenSize();
  
  return {
    screenWidth: width,
    screenHeight: height,
    orientation,
    screenSize,
    isLandscape: isLandscape(),
    isPortrait: isPortrait(),
    isTablet: isTablet(),
    safeAreaPadding: getResponsivePadding(16),
    contentPadding: getResponsivePadding(20),
    gridColumns: getGridColumns(2),
  };
};

/**
 * Responsive style helpers
 */
export const responsiveStyles = {
  /**
   * Get responsive text styles
   */
  text: (baseSize: number) => ({
    fontSize: scaleFontSize(baseSize),
    lineHeight: scaleFontSize(baseSize) * 1.4,
  }),
  
  /**
   * Get responsive container styles
   */
  container: (basePadding: number = 16) => ({
    paddingHorizontal: getResponsivePadding(basePadding),
    paddingVertical: getResponsivePadding(basePadding * 0.75),
  }),
  
  /**
   * Get responsive card styles
   */
  card: (basePadding: number = 16, baseRadius: number = 8) => ({
    padding: getResponsivePadding(basePadding),
    borderRadius: getResponsiveBorderRadius(baseRadius),
    marginHorizontal: getResponsiveMargin(8),
    marginVertical: getResponsiveMargin(4),
  }),
  
  /**
   * Get responsive button styles
   */
  button: (baseHeight: number = 44, basePadding: number = 16) => ({
    height: scaleHeight(baseHeight),
    paddingHorizontal: getResponsivePadding(basePadding),
    borderRadius: getResponsiveBorderRadius(baseHeight / 2),
  }),
};

/**
 * Layout configurations for different orientations
 */
export const getLayoutConfig = () => {
  const { orientation, isTablet: tablet } = getResponsiveDimensions();
  
  return {
    // Audio player layout
    audioPlayer: {
      topicInfoFlex: orientation === ORIENTATIONS.LANDSCAPE ? 0.4 : 0.5,
      controlsSpacing: orientation === ORIENTATIONS.LANDSCAPE ? 16 : 24,
      showVolumeControl: orientation === ORIENTATIONS.LANDSCAPE || tablet,
      compactLayout: orientation === ORIENTATIONS.LANDSCAPE && !tablet,
    },
    
    // Category grid layout
    categoryGrid: {
      columns: getGridColumns(2),
      itemAspectRatio: orientation === ORIENTATIONS.LANDSCAPE ? 1.5 : 1.2,
      spacing: getResponsiveMargin(12),
    },
    
    // Topic list layout
    topicList: {
      itemHeight: orientation === ORIENTATIONS.LANDSCAPE ? 80 : 100,
      showThumbnails: orientation === ORIENTATIONS.PORTRAIT || tablet,
      compactMode: orientation === ORIENTATIONS.LANDSCAPE && !tablet,
    },
  };
};