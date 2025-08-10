/**
 * Audio Topics App
 * Main application entry point - simplified for testing
 *
 * @format
 */

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import store from './src/store';
import CategoryScreen from './src/screens/CategoryScreen';
import TopicListScreen from './src/screens/TopicListScreen';
import AudioPlayerScreen from './src/screens/AudioPlayerScreen';
import MiniPlayerContainer from './src/components/audio/MiniPlayerContainer';
import { AudioTopic, Category } from './src/types';

// Simple navigation state management
type Screen = 'Categories' | 'TopicList' | 'AudioPlayer';

interface NavigationState {
  currentScreen: Screen;
  selectedCategory?: Category;
  selectedTopic?: AudioTopic;
}

function App(): React.JSX.Element {
  const [navState, setNavState] = useState<NavigationState>({
    currentScreen: 'Categories',
  });

  // Simple navigation functions
  const navigateToTopicList = (category: Category) => {
    setNavState({
      currentScreen: 'TopicList',
      selectedCategory: category,
    });
  };

  const navigateToAudioPlayer = (topic: AudioTopic) => {
    setNavState({
      ...navState,
      currentScreen: 'AudioPlayer',
      selectedTopic: topic,
    });
  };

  const navigateBack = () => {
    console.log('App - navigateBack called, current screen:', navState.currentScreen);
    if (navState.currentScreen === 'AudioPlayer') {
      console.log('App - Navigating back from AudioPlayer to TopicList');
      setNavState({
        currentScreen: 'TopicList',
        selectedCategory: navState.selectedCategory, // Keep the selected category
        selectedTopic: undefined, // Clear the selected topic
      });
    } else if (navState.currentScreen === 'TopicList') {
      console.log('App - Navigating back from TopicList to Categories');
      setNavState({
        currentScreen: 'Categories',
        selectedCategory: undefined,
        selectedTopic: undefined,
      });
    }
  };

  // Mock navigation object for screens
  const mockNavigation = {
    navigate: (screen: string, params?: any) => {
      console.log('App - mockNavigation.navigate called:', screen, params);
      if (screen === 'TopicList') {
        navigateToTopicList(params?.category);
      } else if (screen === 'AudioPlayer') {
        navigateToAudioPlayer(params?.topic);
      }
    },
    goBack: () => {
      console.log('App - mockNavigation.goBack called');
      navigateBack();
    },
  };

  const renderCurrentScreen = () => {
    switch (navState.currentScreen) {
      case 'Categories':
        return <CategoryScreen navigation={mockNavigation} />;
      case 'TopicList':
        return (
          <TopicListScreen
            route={{
              params: {
                categoryId: navState.selectedCategory?.id || '',
                categoryName: navState.selectedCategory?.name || 'Topics'
              }
            }}
            navigation={mockNavigation}
          />
        );
      case 'AudioPlayer':
        return (
          <AudioPlayerScreen
            route={{
              params: {
                topic: navState.selectedTopic
              }
            }}
            navigation={mockNavigation}
          />
        );
      default:
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
            <Text style={{ color: '#FFF', fontSize: 24 }}>Audio Topics App</Text>
          </View>
        );
    }
  };

  return (
    <Provider store={store}>
      <View style={styles.container}>
        {/* Current screen */}
        {renderCurrentScreen()}

        {/* Mini player overlay - temporarily disabled for debugging */}
        {/* {navState.currentScreen !== 'AudioPlayer' && <MiniPlayerContainer />} */}
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default App;
