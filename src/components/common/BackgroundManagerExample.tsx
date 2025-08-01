import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BackgroundManager } from './BackgroundManager';

/**
 * Example component demonstrating BackgroundManager usage
 * This shows how to integrate the BackgroundManager with different scenarios
 */

interface ExampleProps {
  scenario: 'category' | 'player' | 'fallback';
}

export const BackgroundManagerExample: React.FC<ExampleProps> = ({ scenario }) => {
  const getScenarioConfig = () => {
    switch (scenario) {
      case 'category':
        return {
          imageUrl: 'https://example.com/category-background.jpg',
          categoryId: 'music-category',
          overlayOpacity: 0.5,
          content: (
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Music Category</Text>
              <Text style={styles.categoryDescription}>
                Discover amazing audio topics in music
              </Text>
            </View>
          ),
        };
      
      case 'player':
        return {
          imageUrl: 'https://example.com/player-background.jpg',
          categoryId: 'audio-player',
          overlayOpacity: 0.7,
          overlayColors: ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)'],
          content: (
            <View style={styles.playerContent}>
              <Text style={styles.playerTitle}>Now Playing</Text>
              <Text style={styles.playerArtist}>Artist Name</Text>
              <Text style={styles.playerTrack}>Track Title</Text>
            </View>
          ),
        };
      
      case 'fallback':
        return {
          imageUrl: undefined, // No image to demonstrate fallback
          categoryId: 'fallback-demo',
          fallbackColor: '#2d1b69',
          content: (
            <View style={styles.fallbackContent}>
              <Text style={styles.fallbackTitle}>Fallback Background</Text>
              <Text style={styles.fallbackDescription}>
                This demonstrates the fallback color when no image is available
              </Text>
            </View>
          ),
        };
      
      default:
        return {
          content: <Text>Unknown scenario</Text>,
        };
    }
  };

  const config = getScenarioConfig();

  return (
    <BackgroundManager
      imageUrl={config.imageUrl}
      categoryId={config.categoryId}
      fallbackColor={config.fallbackColor}
      overlayOpacity={config.overlayOpacity}
      overlayColors={config.overlayColors}
      style={styles.container}
      testID={`background-example-${scenario}`}
    >
      {config.content}
    </BackgroundManager>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  categoryDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  playerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  playerTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  playerArtist: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: 5,
  },
  playerTrack: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  fallbackContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  fallbackDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default BackgroundManagerExample;