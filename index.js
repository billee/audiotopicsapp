/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// TrackPlayer service registration temporarily disabled
// TrackPlayer.registerPlaybackService(() => require('./src/services/trackPlayerService'));
