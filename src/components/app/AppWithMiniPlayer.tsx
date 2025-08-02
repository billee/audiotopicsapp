/**
 * App component with integrated mini player
 * Shows how to integrate the mini player with the main app navigation
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import MiniPlayerContainer from '../audio/MiniPlayerContainer';
import store from '../../store';

// Mock screens for demonstration
const CategoryScreen = () => <View style={styles.screen} />;
const TopicListScreen = () => <View style={styles.screen} />;
const AudioPlayerScreen = () => <View style={styles.screen} />;

const Stack = createStackNavigator();

const AppWithMiniPlayer: React.FC = () => {
  const handleNavigateToPlayer = () => {
    // This would navigate to the full audio player screen
    // In a real app, you'd use navigation.navigate('AudioPlayer')
    console.log('Navigating to full audio player');
  };

  return (
    <Provider store={store}>
      <NavigationContainer>
        <View style={styles.container}>
          {/* Main app navigation */}
          <Stack.Navigator
            initialRouteName="Categories"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1a1a1a',
              },
              headerTintColor: '#ffffff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Categories" 
              component={CategoryScreen}
              options={{ title: 'Audio Topics' }}
            />
            <Stack.Screen 
              name="TopicList" 
              component={TopicListScreen}
              options={{ title: 'Topics' }}
            />
            <Stack.Screen 
              name="AudioPlayer" 
              component={AudioPlayerScreen}
              options={{ 
                title: 'Now Playing',
                headerShown: false, // Hide header for full-screen player
              }}
            />
          </Stack.Navigator>

          {/* Mini player overlay - appears above navigation */}
          <MiniPlayerContainer 
            onNavigateToPlayer={handleNavigateToPlayer}
          />
        </View>
      </NavigationContainer>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screen: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});

export default AppWithMiniPlayer;