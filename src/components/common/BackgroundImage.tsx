import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

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
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  });

  // Convert resizeMode to FastImage format
  const getFastImageResizeMode = (mode: string) => {
    switch (mode) {
      case 'cover':
        return FastImage.resizeMode.cover;
      case 'contain':
        return FastImage.resizeMode.contain;
      case 'stretch':
        return FastImage.resizeMode.stretch;
      case 'center':
        return FastImage.resizeMode.center;
      default:
        return FastImage.resizeMode.cover;
    }
  };

  const handleLoadStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      error: null,
    }));
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoad = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      imageLoaded: true,
      error: null,
    }));
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: any) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
      imageLoaded: false,
      error,
    }));
    onError?.(error);
  }, [onError]);

  const handleRetry = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      imageLoaded: false,
      error: null,
    }));
  }, []);

  // Reset state when source changes
  useEffect(() => {
    setState({
      isLoading: false,
      hasError: false,
      imageLoaded: false,
      error: null,
    });
  }, [source]);

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
    if (state.hasError) {
      // Fallback to solid color background
      return (
        <View
          style={[styles.fallbackBackground, { backgroundColor: fallbackColor }]}
          testID={`${testID}-fallback`}
        />
      );
    }

    return (
      <FastImage
        source={typeof source === 'number' ? source : {
          ...getImageSource(),
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.immutable,
        }}
        style={[styles.backgroundImage, imageStyle]}
        resizeMode={getFastImageResizeMode(resizeMode)}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        testID={`${testID}-image`}
      />
    );
  };

  const renderOverlay = () => {
    if (!overlay || (!state.imageLoaded && !state.hasError)) {
      return null;
    }

    return (
      <LinearGradient
        colors={overlayColors}
        style={[styles.overlay, { opacity: overlayOpacity }]}
        testID={`${testID}-overlay`}
      />
    );
  };

  const renderLoadingState = () => {
    if (!showLoadingState || !state.isLoading) {
      return null;
    }

    return (
      <View style={styles.loadingContainer} testID={`${testID}-loading`}>
        <LoadingSpinner message="Loading background..." size="large" />
      </View>
    );
  };

  const renderErrorState = () => {
    if (!showErrorState || !state.hasError) {
      return null;
    }

    return (
      <View style={styles.errorContainer} testID={`${testID}-error`}>
        <ErrorMessage
          message="Failed to load background image"
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
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
  fallbackBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 2,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 2,
  },
});

export default BackgroundImage;