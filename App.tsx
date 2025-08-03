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
    if (navState.currentScreen === 'AudioPlayer') {
      setNavState({
        ...navState,
        currentScreen: 'TopicList',
      });
    } else if (navState.currentScreen === 'TopicList') {
      setNavState({
        currentScreen: 'Categories',
      });
    }
  };

  // Mock navigation object for screens
  const mockNavigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'TopicList') {
        navigateToTopicList(params?.category);
      } else if (screen === 'AudioPlayer') {
        navigateToAudioPlayer(params?.topic);
      }
    },
    goBack: navigateBack,
  };

  const renderCurrentScreen = () => {
    switch (navState.currentScreen) {
      case 'Categories':
        // Create a minimal test version of CategoryScreen
        return (
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
                Audio Topics
              </Text>
              <Text style={{ color: '#E0E0E0', fontSize: 16, textAlign: 'center', marginBottom: 32 }}>
                Discover engaging audio content
              </Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, marginBottom: 16 }}
                onPress={() => {
                  const techCategory: Category = { id: '1', name: 'Technology', description: 'Tech topics', topicCount: 15, color: '#4A90E2' };
                  navigateToTopicList(techCategory);
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>Technology</Text>
                <Text style={{ color: '#E0E0E0', fontSize: 12 }}>15 topics</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ backgroundColor: '#50C878', padding: 16, borderRadius: 12, marginBottom: 16 }}
                onPress={() => {
                  const scienceCategory: Category = { id: '2', name: 'Science', description: 'Science topics', topicCount: 12, color: '#50C878' };
                  navigateToTopicList(scienceCategory);
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>Science</Text>
                <Text style={{ color: '#E0E0E0', fontSize: 12 }}>12 topics</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ backgroundColor: '#D2691E', padding: 16, borderRadius: 12 }}
                onPress={() => {
                  const historyCategory: Category = { id: '3', name: 'History', description: 'History topics', topicCount: 20, color: '#D2691E' };
                  navigateToTopicList(historyCategory);
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>History</Text>
                <Text style={{ color: '#E0E0E0', fontSize: 12 }}>20 topics</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
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
