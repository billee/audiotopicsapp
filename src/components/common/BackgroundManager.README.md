# BackgroundManager Component

The `BackgroundManager` component provides a robust solution for handling background images with automatic fallback support, contrast overlays, and intelligent caching. It's designed specifically for the Audio Topics App to ensure text readability over dynamic background images.

## Features

- **Image Loading with Caching**: Uses `react-native-fast-image` for optimized image loading and caching
- **Automatic Fallback**: Gracefully falls back to solid colors when images fail to load
- **Contrast Overlay System**: Ensures text readability with customizable gradient overlays
- **Category-based Colors**: Generates consistent fallback colors based on category IDs
- **Error Handling**: Robust error handling for network issues and invalid images
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Basic Usage

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import { BackgroundManager } from '../components/common';

const MyScreen = () => (
  <BackgroundManager
    imageUrl="https://example.com/background.jpg"
    categoryId="music"
  >
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 24 }}>
        Content with readable text
      </Text>
    </View>
  </BackgroundManager>
);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageUrl` | `string?` | `undefined` | URL of the background image to load |
| `fallbackColor` | `string?` | Auto-generated | Fallback color when image fails or is not provided |
| `overlayOpacity` | `number?` | `0.6` | Opacity of the contrast overlay (0-1) |
| `overlayColors` | `string[]?` | Auto-generated | Array of colors for the gradient overlay |
| `children` | `ReactNode` | Required | Content to render over the background |
| `style` | `ViewStyle?` | `undefined` | Additional styles for the container |
| `testID` | `string?` | `'background-manager'` | Test identifier for testing |
| `categoryId` | `string?` | `undefined` | Category ID for consistent fallback color generation |
| `autoAdjustOverlay` | `boolean?` | `true` | Whether to automatically adjust overlay based on image brightness |

## Advanced Usage

### Custom Overlay Configuration

```tsx
<BackgroundManager
  imageUrl="https://example.com/bright-image.jpg"
  overlayOpacity={0.8}
  overlayColors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
>
  <YourContent />
</BackgroundManager>
```

### Category-based Fallback Colors

```tsx
<BackgroundManager
  imageUrl="https://example.com/category-image.jpg"
  categoryId="music-category"
  // Will generate a consistent color for this category
>
  <YourContent />
</BackgroundManager>
```

### Fallback-only Mode

```tsx
<BackgroundManager
  fallbackColor="#2d1b69"
  overlayOpacity={0.3}
>
  <YourContent />
</BackgroundManager>
```

## Image Loading States

The component handles three main states:

1. **Loading**: Image is being fetched
2. **Loaded**: Image successfully loaded and displayed
3. **Error**: Image failed to load, fallback color is shown

## Overlay System

The overlay system ensures text readability by applying a gradient overlay over background images:

- **Default Overlay**: `['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']`
- **Auto-adjustment**: When `autoAdjustOverlay` is true, overlay colors are optimized based on image characteristics
- **Customizable**: Full control over overlay colors and opacity

## Fallback Color Generation

When no `fallbackColor` is provided, the component generates colors based on:

1. **Category ID**: Consistent colors for the same category
2. **Predefined Palette**: Carefully selected colors that work well with white text
3. **Hash-based Selection**: Deterministic color selection for consistency

Available fallback colors:
- `#1a1a2e` (Dark blue)
- `#16213e` (Navy)
- `#0f3460` (Deep blue)
- `#533483` (Purple)
- `#7209b7` (Violet)
- `#2d1b69` (Dark purple)
- `#11698e` (Teal)
- `#19456b` (Steel blue)

## Performance Considerations

- **Image Caching**: Uses `react-native-fast-image` with immutable cache control
- **High Priority Loading**: Images are loaded with high priority for better UX
- **Memory Management**: Proper cleanup of image resources
- **Efficient Re-renders**: Optimized state management to minimize unnecessary re-renders

## Testing

The component includes comprehensive test coverage:

```bash
npm test -- src/components/common/__tests__/BackgroundManager.test.tsx
```

Test categories:
- Rendering behavior
- Fallback background handling
- Image loading states
- Overlay configuration
- Error handling
- Accessibility

## Color Utilities

The component uses several color utility functions:

- `generateFallbackColor()`: Creates consistent colors based on category ID
- `generateOverlayColors()`: Creates appropriate overlay colors
- `calculateContrastRatio()`: Ensures sufficient contrast for accessibility
- `isColorDark()`: Determines if a color is dark or light

## Integration Examples

### Category Screen

```tsx
<BackgroundManager
  imageUrl={category.backgroundImageUrl}
  categoryId={category.id}
  overlayOpacity={0.5}
>
  <CategoryContent category={category} />
</BackgroundManager>
```

### Audio Player Screen

```tsx
<BackgroundManager
  imageUrl={currentTopic.thumbnailUrl}
  categoryId={currentTopic.categoryId}
  overlayOpacity={0.7}
  overlayColors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
>
  <AudioPlayerControls />
</BackgroundManager>
```

### Topic List Screen

```tsx
<BackgroundManager
  imageUrl={category.backgroundImageUrl}
  categoryId={category.id}
  autoAdjustOverlay={true}
>
  <TopicList topics={topics} />
</BackgroundManager>
```

## Accessibility

The component follows accessibility best practices:

- **Contrast Ratios**: Ensures sufficient contrast between text and background
- **Test IDs**: Provides comprehensive test identifiers for automated testing
- **Screen Reader Support**: Compatible with screen readers through proper semantic structure

## Error Handling

Robust error handling includes:

- **Network Errors**: Graceful fallback when images can't be loaded
- **Invalid URLs**: Handles malformed or invalid image URLs
- **Memory Issues**: Proper cleanup to prevent memory leaks
- **Loading Timeouts**: Handles slow network conditions

## Browser/Platform Support

- **iOS**: Full support with native image caching
- **Android**: Full support with native image caching
- **React Native**: Requires React Native 0.60+
- **Dependencies**: `react-native-fast-image`, `react-native-linear-gradient`

## Migration Guide

If migrating from a basic Image component:

```tsx
// Before
<Image source={{ uri: imageUrl }} style={styles.background}>
  <YourContent />
</Image>

// After
<BackgroundManager imageUrl={imageUrl} categoryId="your-category">
  <YourContent />
</BackgroundManager>
```

## Contributing

When contributing to the BackgroundManager component:

1. Ensure all tests pass
2. Add tests for new functionality
3. Update this README for new features
4. Follow the existing code style
5. Consider performance implications

## Related Components

- `LoadingSpinner`: Used for loading states
- `ErrorMessage`: Used for error display
- Color utilities in `src/utils/colorUtils.ts`