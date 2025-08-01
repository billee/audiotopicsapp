import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { generateFallbackColor, generateOverlayColors } from '../../utils/colorUtils';

interface BackgroundManagerProps {
  imageUrl?: string;
  fallbackColor?: string;
  overlayOpacity?: number;
  overlayColors?: string[];
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
  categoryId?: string;
  autoAdjustOverlay?: boolean;
}

interface BackgroundState {
  isLoading: boolean;
  hasError: boolean;
  imageLoaded: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({
  imageUrl,
  fallbackColor,
  overlayOpacity = 0.6,
  overlayColors,
  children,
  style,
  testID = 'background-manager',
  categoryId,
  autoAdjustOverlay = true,
}) => {
  const [backgroundState, setBackgroundState] = useState<BackgroundState>({
    isLoading: false,
    hasError: false,
    imageLoaded: false,
  });

  // Generate fallback color based on category if not provided
  const effectiveFallbackColor = fallbackColor || generateFallbackColor(categoryId);
  
  // Generate overlay colors if not provided and auto-adjust is enabled
  const effectiveOverlayColors = overlayColors || (autoAdjustOverlay 
    ? generateOverlayColors(false) // Default to assuming light image
    : ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']);

  const handleImageLoadStart = useCallback(() => {
    setBackgroundState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
    }));
  }, []);

  const handleImageLoad = useCallback(() => {
    setBackgroundState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      imageLoaded: true,
    }));
  }, []);

  const handleImageError = useCallback(() => {
    setBackgroundState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
      imageLoaded: false,
    }));
  }, []);

  // Reset state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setBackgroundState({
        isLoading: false,
        hasError: false,
        imageLoaded: false,
      });
    }
  }, [imageUrl]);

  const renderBackground = () => {
    if (!imageUrl || backgroundState.hasError) {
      // Fallback to solid color background
      return (
        <View
          style={[styles.fallbackBackground, { backgroundColor: effectiveFallbackColor }]}
          testID={`${testID}-fallback`}
        />
      );
    }

    return (
      <FastImage
        source={{
          uri: imageUrl,
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.immutable,
        }}
        style={styles.backgroundImage}
        resizeMode={FastImage.resizeMode.cover}
        onLoadStart={handleImageLoadStart}
        onLoad={handleImageLoad}
        onError={handleImageError}
        testID={`${testID}-image`}
      />
    );
  };

  const renderOverlay = () => {
    if (!backgroundState.imageLoaded && !backgroundState.hasError) {
      return null;
    }

    return (
      <LinearGradient
        colors={effectiveOverlayColors}
        style={[styles.overlay, { opacity: overlayOpacity }]}
        testID={`${testID}-overlay`}
      />
    );
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {renderBackground()}
      {renderOverlay()}
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
});

export default BackgroundManager;