import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Track Player Service
 * This service handles background playback events and must be registered
 * with TrackPlayer for background audio to work properly.
 */
module.exports = async function() {
  // This service will run in the background and handle remote events
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
  
  // Handle playback queue ended
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (event) => {
    console.log('Playback queue ended:', event);
  });

  // Handle playback errors
  TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
    console.error('Playback error:', event);
  });
};