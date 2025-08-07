# Science Audio Player Background Implementation

## Request
Use `health.png` as the background image for all science topics on their audio player pages.

## Implementation

### 1. **Added Science-Specific Audio Player Background**
Added a new `science` entry to `audioPlayerBackgrounds`:
```typescript
science: {
    local: require('./topic-list/health.png'),
    remote: null, // Use local asset only for reliability
    description: 'Science-themed background for all science topics using health.png'
}
```

### 2. **Enhanced Local Asset Resolution**
Updated `getLocalAssetByContext` to handle science category for audio player:
- Maps categoryId '2' to 'science'
- Returns `health.png` for all science topics in audio player
- Falls back to default for other categories

### 3. **Enhanced Remote URL Resolution**
Updated `getRemoteUrlByContext` to handle science category for audio player:
- Maps categoryId '2' to 'science'
- Returns `null` for science (forces local asset usage)
- Falls back to default for other categories

### 4. **Updated AudioPlayerScreen Context**
Modified AudioPlayerScreen to pass `categoryId` in the background context:
```typescript
const context: BackgroundContext = {
  type: 'audio-player',
  categoryId: topic?.categoryId?.toString(), // Pass categoryId for science-specific backgrounds
  topicId: topic?.id 
};
```

## Expected Behavior

### For Science Topics (categoryId: '2'):
- ✅ Audio player will use `health.png` as background
- ✅ Reliable local asset loading (no network dependency)
- ✅ Consistent science-themed visual experience
- ✅ Same background for all science topics

### For Other Categories:
- ✅ Continue using default audio player background
- ✅ No changes to existing behavior

## Console Output Expected
When playing a science topic:
```
AudioPlayerScreen - using context: {type: 'audio-player', categoryId: '2', topicId: 'topic-id'}
Audio player - mapped categoryId 2 to categoryName: science
Using science-specific background for audio player
```

## Files Modified
1. `src/assets/backgrounds/index.ts` - Added science audio player background configuration
2. `src/screens/AudioPlayerScreen.tsx` - Updated context to include categoryId

## Visual Result
All science topics will now have a consistent, professional background using the `health.png` image when playing audio, creating a cohesive science-themed experience throughout the app.