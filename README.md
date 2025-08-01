# Audio Topics App

A React Native mobile application that provides users with an audio-focused experience for listening to categorized topics. The app features a clean interface with beautiful background imagery, organized topic categories, and a robust audio playback system.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── audio/          # Audio player components
│   ├── category/       # Category-related components
│   ├── common/         # Common/shared components
│   └── topic/          # Topic-related components
├── screens/            # Screen components
├── services/           # Business logic services
├── store/              # Redux store configuration
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── constants/          # App constants
```

## Features

- **Category-based Content Organization**: Browse audio topics by category
- **Professional Audio Controls**: Full-featured audio player with background playback
- **Beautiful UI**: Attractive background images with proper contrast
- **Progress Tracking**: Remember listening progress and resume functionality
- **Offline Support**: Audio caching for offline playback
- **Cross-platform**: Works on both iOS and Android

## Tech Stack

- **Framework**: React Native with TypeScript
- **Audio Engine**: react-native-track-player
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 6
- **Storage**: AsyncStorage
- **Image Handling**: react-native-fast-image

## Getting Started

### Prerequisites

- Node.js (>=18)
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. For iOS, install CocoaPods dependencies:
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

#### Start Metro Bundler
```bash
npm start
```

#### Run on Android
```bash
npm run android
```

#### Run on iOS
```bash
npm run ios
```

## Development Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - Run TypeScript type checking

## Development Tools

- **ESLint**: Code linting with React Native specific rules
- **Prettier**: Code formatting
- **TypeScript**: Type safety and better development experience
- **Jest**: Testing framework
- **VS Code**: Recommended editor with debugging configuration

## Architecture

The app follows a modular architecture with clear separation of concerns:

- **Components**: Reusable UI components organized by feature
- **Screens**: Top-level screen components
- **Services**: Business logic and external API interactions
- **Store**: Redux state management
- **Utils**: Helper functions and utilities

## Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Use TypeScript for type safety

## License

This project is private and proprietary.