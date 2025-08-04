# Background Images Asset Organization

This directory contains the organized structure for background images used throughout the audio topics application.

## Directory Structure

```
src/assets/backgrounds/
├── category-screen/          # Category screen backgrounds
│   ├── default.jpg          # Main category screen background
│   └── fallback.jpg         # Fallback background for category screen
├── topic-list/              # Topic list backgrounds (category-specific)
│   ├── technology.jpg       # Technology category background
│   ├── science.jpg          # Science category background
│   ├── history.jpg          # History category background
│   ├── business.jpg         # Business category background
│   ├── health.jpg           # Health category background
│   ├── arts.jpg             # Arts category background
│   └── default.jpg          # Default topic list background
├── audio-player/            # Audio player backgrounds
│   ├── default.jpg          # Default audio player background
│   ├── ambient-1.jpg        # Ambient background option 1
│   ├── ambient-2.jpg        # Ambient background option 2
│   ├── ambient-3.jpg        # Ambient background option 3
│   └── ambient-4.jpg        # Ambient background option 4
├── index.ts                 # Asset exports and organization
└── README.md               # This documentation file
```

## Asset Organization Features

### 1. Context-Specific Backgrounds
- **Category Screen**: General audio/education themed backgrounds
- **Topic List**: Category-specific backgrounds that match the subject matter
- **Audio Player**: Ambient, calming backgrounds for focused listening

### 2. High-Quality Image Standards
- Minimum resolution: 800x600 pixels
- Maximum resolution: 2400x1800 pixels (to prevent memory issues)
- Optimized for different screen densities
- WebP format preferred with JPG fallback

### 3. Fallback Strategy
- Local assets serve as fallbacks for remote images
- Solid color fallbacks for complete failure scenarios
- Graceful degradation ensures app functionality

## Usage

### Importing Assets
```typescript
import { backgroundAssets } from '../assets/backgrounds';

// Get category screen background
const categoryBg = backgroundAssets.categoryScreen.default.remote;

// Get category-specific background
const techBg = backgroundAssets.topicList.technology.remote;

// Get random ambient background
import { getRandomAmbientBackground } from '../assets/backgrounds';
const ambientBg = getRandomAmbientBackground();
```

### Using Utility Functions
```typescript
import { 
    getRemoteBackgroundUrl, 
    getLocalBackgroundAsset,
    categoryHasBackground 
} from '../utils/backgroundImages';

// Get background for specific context
const context = { type: 'topic-list', categoryId: 'technology' };
const bgUrl = getRemoteBackgroundUrl(context);

// Check if category has dedicated background
if (categoryHasBackground('science')) {
    // Use science-specific background
}
```

## Image Specifications

### Category Screen Backgrounds
- **Purpose**: Welcome users with professional, inviting imagery
- **Style**: Warm, educational themes with subtle patterns
- **Overlay**: Medium opacity (0.4) for text readability

### Topic List Backgrounds
- **Purpose**: Reinforce category branding and subject matter
- **Style**: Subject-specific imagery (tech, science, history, etc.)
- **Overlay**: Higher opacity (0.5) for list item readability

### Audio Player Backgrounds
- **Purpose**: Create ambient, focused listening environment
- **Style**: Calming, non-distracting patterns and gradients
- **Overlay**: Lower opacity (0.3) for ambient feel

## Performance Considerations

### Image Optimization
- Images are served from CDN (Unsplash) for optimal loading
- Local assets provide offline-first experience
- Responsive image URLs generated based on screen size
- Lazy loading implemented for non-critical backgrounds

### Caching Strategy
- Frequently used backgrounds are preloaded
- LRU cache with configurable size limits
- Memory cleanup for unused images
- Cache expiration after 24 hours

### Error Handling
- Graceful fallback to local assets
- Solid color fallbacks for complete failures
- Retry mechanism with exponential backoff
- Loading states and error recovery

## Adding New Backgrounds

### 1. Add Image Files
Place new image files in the appropriate context directory:
- Category screen: `category-screen/`
- Topic list: `topic-list/`
- Audio player: `audio-player/`

### 2. Update Asset Index
Add entries to `index.ts`:
```typescript
export const topicListBackgrounds = {
  // ... existing entries
  newCategory: {
    local: require('./topic-list/new-category.jpg'),
    remote: 'https://images.unsplash.com/photo-xyz?w=800&h=600&fit=crop&crop=center',
    description: 'Description of the new category background'
  }
};
```

### 3. Update Configuration
Update `src/utils/assetConfig.ts` if needed for new categories or contexts.

### 4. Test Integration
Run tests to ensure proper integration:
```bash
npm test -- --testPathPattern="backgroundImages|assetConfig"
```

## Quality Guidelines

### Image Selection Criteria
- High resolution and professional quality
- Appropriate for educational/audio content context
- Good contrast potential for text overlay
- Consistent visual style across categories
- Culturally appropriate and inclusive

### Technical Requirements
- Format: WebP preferred, JPG fallback
- Resolution: 800x600 minimum, 2400x1800 maximum
- File size: Optimized for web delivery
- Color space: sRGB
- Compression: Balanced quality/size ratio

## Accessibility

### Contrast Requirements
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text
- Dynamic overlay adjustment based on image brightness
- Alternative text descriptions for screen readers

### User Preferences
- Option to disable background images
- Reduced motion support
- High contrast mode compatibility
- Screen reader friendly implementations