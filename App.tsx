/**
 * Audio Topics App
 * Main application entry point
 *
 * @format
 */

import React from 'react';
import { Provider } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import store from './src/store';
import CategoryScreen from './src/screens/CategoryScreen';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <CategoryScreen />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
