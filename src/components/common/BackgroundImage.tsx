import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ViewStyle,
  ImageStyle,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { getResponsiveDimensions, getOptimalImageSize, generateResponsiveImageUrls } from '../../utils/responsive';
import { useBackgroundImagePerformance } from '../../utils/backgroundImagePerformance';

export interface BackgroundImageProps {
  source: string | { uri: string };
  overlay?: boolean;
  overlayOpacity?: number;
  overlayColors?: string[];
  children: React.ReactNode;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  fallbackColor?: string;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  enableTransitions?: boolean;
  transitionDuration?: number;
  enableResponsiveImages?: boolean;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  testID?: string;
}

interface BackgroundImageState {
  isLoading: boolean;
  hasError: boolean;
  imageLoaded: boolean;
  error: any;
  dimensions: {
    width: number;
    height: number;
  };
}

// Get initial screen dimensions
const getScreenDimensions = () => {
  try {
    return Dimensions.get('window');
  } catch (error) {
    return { width: 375, height: 812 }; // Fallback dimensions
  }
};

const initialDimensions = getScreenDimensions();

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  source,
  overlay = true,
  overlayOpacity = 0.4,
  overlayColors = ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)'],
  children,
  style,
  imageStyle,
  resizeMode = 'cover',
  fallbackColor = '#1a1a1a',
  showLoadingState = true,
  showErrorState = true,
  enableTransitions = true,
  transitionDuration = 300,
  enableResponsiveImages = true,
  onLoad,
  onError,
  onLoadStart,
  testID = 'background-image',
}) => {
  const [state, setState] = useState<BackgroundImageState>({
    isLoading: false,
    hasError: false,
    imageLoaded: false,
    error: null,
    dimensions: initialDimensions,
  });

  // Animation values for smooth transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1.05)).current;
  
  // Track previous source for transition effects
  const previousSource = useRef<string | { uri: string } | null>(null);

  // Performance monitoring
  const { recordLoadStart, recordLoadComplete } = useBackgroundImagePerformance();

  // Convert resizeMode to FastImage format
  const getFastImageResizeMode = (mode: string) => {
    switch (mode) {
      case 'cover':
        return FastImage.resizeMode?.cover || 'cover';
      case 'contain':
        return FastImage.resizeMode?.contain || 'contain';
      case 'stretch':
        return FastImage.resizeMode?.stretch || 'stretch';
      case 'center':
        return FastImage.resizeMode?.center || 'center';
      default:
        return FastImage.resizeMode?.cover || 'cover';
    }
  };

  // Get optimal image source based on screen dimensions
  const getOptimalImageSource = useCallback(() => {
    if (typeof source === 'number') {
      return source; // Local asset, return as-is
    }

    const sourceUri = typeof source === 'string' ? source : 
                     (source && typeof source === 'object' && source !== null && 'uri' in source) ? source.uri : 
                     String(source);
    
    if (!enableResponsiveImages || !sourceUri || typeof sourceUri !== 'string' || !sourceUri.includes('unsplash.com')) {
      return typeof source === 'string' ? { uri: source } : source;
    }

    try {
      // Generate responsive URLs for remote images
      const responsiveUrls = generateResponsiveImageUrls(sourceUri);
      const optimalSize = getOptimalImageSize(state.dimensions.width, state.dimensions.height);
      const responsiveUrl = responsiveUrls[optimalSize];
      
      console.log('Generated responsive URL:', responsiveUrl, 'for size:', optimalSize);
      return { uri: responsiveUrl };
    } catch (error) {
      console.warn('Failed to generate responsive URL, using original:', error);
      return typeof source === 'string' ? { uri: source } : source;
    }
  }, [source, enableResponsiveImages, state.dimensions]);

  // Handle screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setState(prev => ({
        ...prev,
        dimensions: window,
      }));
    });

    return () => subscription?.remove();
  }, []);

  const handleLoadStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      error: null,
    }));
    
    // Record performance metrics
    const sourceUri = typeof source === 'string' ? source : 
                     (source && typeof source === 'object' && source !== null && 'uri' in source) ? source.uri : 
                     String(source);
    const imageSize = getOptimalImageSize(state.dimensions.width, state.dimensions.height);
    recordLoadStart(sourceUri, imageSize);
    
    // Start fade out animation if transitioning
    if (enableTransitions && previousSource.current !== null) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: transitionDuration / 2,
        useNativeDriver: true,
      }).start();
    }
    
    onLoadStart?.();
  }, [onLoadStart, enableTransitions, transitionDuration, fadeAnim, source, state.dimensions, recordLoadStart]);

  const handleLoad = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      imageLoaded: true,
      error: null,
    }));
    
    // Record successful load
    const sourceUri = typeof source === 'string' ? source : 
                     (source && typeof source === 'object' && source !== null && 'uri' in source) ? source.uri : 
                     String(source);
    recordLoadComplete(sourceUri, true);
    
    // Start fade in animation with subtle scale effect
    if (enableTransitions) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: transitionDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: transitionDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    onLoad?.();
  }, [onLoad, enableTransitions, transitionDuration, fadeAnim, scaleAnim, source, recordLoadComplete]);

  const handleError = useCallback((error: any) => {
    console.log('BackgroundImage error:', error);
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
      imageLoaded: false,
      error,
    }));
    
    // Record failed load
    const sourceUri = typeof source === 'string' ? source : 
                     (source && typeof source === 'object' && source !== null && 'uri' in source) ? source.uri : 
                     String(source);
    recordLoadComplete(sourceUri, false, error?.message || 'Unknown error');
    
    // Reset animations on error
    if (enableTransitions) {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
    
    onError?.(error);
  }, [onError, enableTransitions, fadeAnim, scaleAnim, source, recordLoadComplete]);

  const handleRetry = useCallback(() => {
    console.log('BackgroundImage retry triggered');
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      imageLoaded: false,
      error: null,
    }));
    
    // Reset animations for retry
    if (enableTransitions) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(1.05);
    }
  }, [enableTransitions, fadeAnim, scaleAnim]);

  // Handle source changes with transitions
  useEffect(() => {
    const currentSourceUri = typeof source === 'string' ? source : 
                            (source && typeof source === 'object' && source !== null && 'uri' in source) ? source.uri : 
                            String(source);
    const previousSourceUri = typeof previousSource.current === 'string' ? previousSource.current :
                             (previousSource.current && typeof previousSource.current === 'object' && previousSource.current !== null && 'uri' in previousSource.current) ? previousSource.current.uri :
                             String(previousSource.current);

    // Only reset if source actually changed
    if (currentSourceUri !== previousSourceUri) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: false,
        imageLoaded: false,
        error: null,
      }));

      // Initialize animations for new image
      if (enableTransitions) {
        fadeAnim.setValue(0);
        scaleAnim.setValue(1.05);
      }

      previousSource.current = source;
    }
  }, [source, enableTransitions, fadeAnim, scaleAnim]);

  const getImageSource = () => {
    if (typeof source === 'string') {
      return { uri: source };
    }
    // Handle local assets from require()
    if (typeof source === 'number') {
      return source;
    }
    return source;
  };

  const renderBackground = () => {
    // Check if source is null or invalid
    if (!source || source === null || (typeof source === 'string' && source.trim() === '')) {
      console.log('No valid source provided, showing fallback');
      return (
        <View
          style={[
            styles.fallbackBackground, 
            { 
              backgroundColor: fallbackColor,
              width: state.dimensions.width,
              height: state.dimensions.height,
            }
          ]}
          testID={`${testID}-fallback`}
        />
      );
    }

    if (state.hasError) {
      // Fallback to solid color background with responsive dimensions
      return (
        <View
          style={[
            styles.fallbackBackground, 
            { 
              backgroundColor: fallbackColor,
              width: state.dimensions.width,
              height: state.dimensions.height,
            }
          ]}
          testID={`${testID}-fallback`}
        />
      );
    }

    const imageSource = getOptimalImageSource();
    const animatedStyle = enableTransitions ? {
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }],
    } : {};

    return (
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <FastImage
          source={typeof source === 'number' ? source : {
            ...imageSource,
            priority: FastImage.priority?.high || 'high',
            cache: FastImage.cacheControl?.immutable || 'immutable',
          }}
          style={[
            styles.backgroundImage, 
            imageStyle,
            {
              width: state.dimensions.width,
              height: state.dimensions.height,
            }
          ]}
          resizeMode={getFastImageResizeMode(resizeMode)}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          testID={`${testID}-image`}
        />
      </Animated.View>
    );
  };

  const renderOverlay = () => {
    if (!overlay || (!state.imageLoaded && !state.hasError)) {
      return null;
    }

    const overlayAnimatedStyle = enableTransitions ? {
      opacity: Animated.multiply(fadeAnim, overlayOpacity),
    } : { opacity: overlayOpacity };

    return (
      <Animated.View
        style={[
          styles.overlay,
          overlayAnimatedStyle,
          {
            width: state.dimensions.width,
            height: state.dimensions.height,
          }
        ]}
        testID={`${testID}-overlay`}
      >
        <LinearGradient
          colors={overlayColors}
          style={styles.overlayGradient}
        />
      </Animated.View>
    );
  };

  const renderLoadingState = () => {
    if (!showLoadingState || !state.isLoading) {
      return null;
    }

    return (
      <View 
        style={[
          styles.loadingContainer,
          {
            width: state.dimensions.width,
            height: state.dimensions.height,
          }
        ]} 
        testID={`${testID}-loading`}
      >
        <LoadingSpinner message="Loading background..." size="large" />
      </View>
    );
  };

  const renderErrorState = () => {
    if (!showErrorState || !state.hasError) {
      return null;
    }

    return (
      <View 
        style={[
          styles.errorContainer,
          {
            width: state.dimensions.width,
            height: state.dimensions.height,
          }
        ]} 
        testID={`${testID}-error`}
      >
        <ErrorMessage
          message={`Failed to load background image${state.error?.message ? ': ' + state.error.message : ''}`}
          onRetry={handleRetry}
          retryText="Retry"
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {renderBackground()}
      {renderOverlay()}
      {renderLoadingState()}
      {renderErrorState()}
      <View style={styles.content} testID={`${testID}-content`}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden', // Prevent scale animation overflow
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fallbackBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlayGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackgroundImage;