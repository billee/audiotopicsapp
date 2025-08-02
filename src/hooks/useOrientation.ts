/**
 * Hook for handling device orientation changes and responsive design
 */

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
  getOrientation,
  getScreenSize,
  getResponsiveDimensions,
  getLayoutConfig,
  isLandscape,
  isPortrait,
  isTablet,
  Orientation,
  ScreenSize,
} from '../utils/responsive';

interface OrientationState {
  orientation: Orientation;
  screenSize: ScreenSize;
  dimensions: {
    width: number;
    height: number;
  };
  isLandscape: boolean;
  isPortrait: boolean;
  isTablet: boolean;
  responsiveDimensions: ReturnType<typeof getResponsiveDimensions>;
  layoutConfig: ReturnType<typeof getLayoutConfig>;
}

/**
 * Hook that provides orientation and responsive design information
 * Updates automatically when device orientation changes
 */
export const useOrientation = () => {
  const [orientationState, setOrientationState] = useState<OrientationState>(() => {
    let width = 375;
    let height = 812;
    
    try {
      const dimensions = Dimensions.get('window');
      width = dimensions.width;
      height = dimensions.height;
    } catch (error) {
      // Use fallback dimensions for testing
    }
    
    return {
      orientation: getOrientation(),
      screenSize: getScreenSize(),
      dimensions: { width, height },
      isLandscape: isLandscape(),
      isPortrait: isPortrait(),
      isTablet: isTablet(),
      responsiveDimensions: getResponsiveDimensions(),
      layoutConfig: getLayoutConfig(),
    };
  });

  useEffect(() => {
    const updateOrientation = ({ window }: { window: ScaledSize }) => {
      const newState: OrientationState = {
        orientation: getOrientation(),
        screenSize: getScreenSize(),
        dimensions: { width: window.width, height: window.height },
        isLandscape: isLandscape(),
        isPortrait: isPortrait(),
        isTablet: isTablet(),
        responsiveDimensions: getResponsiveDimensions(),
        layoutConfig: getLayoutConfig(),
      };
      
      setOrientationState(newState);
    };

    // Subscribe to orientation changes
    let subscription: any;
    try {
      subscription = Dimensions.addEventListener('change', updateOrientation);
    } catch (error) {
      // Handle case where Dimensions is not available (testing)
    }

    // Cleanup subscription
    return () => {
      subscription?.remove();
    };
  }, []);

  return orientationState;
};

/**
 * Hook that provides responsive styles based on current orientation
 */
export const useResponsiveStyles = () => {
  const { responsiveDimensions, layoutConfig } = useOrientation();
  
  return {
    ...responsiveDimensions,
    layoutConfig,
    
    // Helper functions for creating responsive styles
    getResponsiveStyle: (portraitStyle: any, landscapeStyle: any) => {
      return responsiveDimensions.isLandscape ? landscapeStyle : portraitStyle;
    },
    
    getTabletStyle: (phoneStyle: any, tabletStyle: any) => {
      return responsiveDimensions.isTablet ? tabletStyle : phoneStyle;
    },
    
    getScreenSizeStyle: (styles: { small?: any; medium?: any; large?: any }) => {
      return styles[responsiveDimensions.screenSize] || styles.medium || {};
    },
  };
};

/**
 * Hook that triggers a callback when orientation changes
 */
export const useOrientationChange = (callback: (orientation: Orientation) => void) => {
  const { orientation } = useOrientation();
  
  useEffect(() => {
    callback(orientation);
  }, [orientation, callback]);
};

/**
 * Hook that provides layout-specific configurations
 */
export const useLayoutConfig = () => {
  const { layoutConfig } = useOrientation();
  return layoutConfig;
};