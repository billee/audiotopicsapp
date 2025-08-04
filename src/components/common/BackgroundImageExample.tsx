import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBackgroundImage } from '../../hooks/useBackgroundImage';
import BackgroundImage from './BackgroundImage';
import { BackgroundContext } from '../../types/backgroundImage';

interface BackgroundImageExampleProps {
    context: BackgroundContext;
    children?: React.ReactNode;
}

/**
 * Example component demonstrating how to use the background image selection system
 */
const BackgroundImageExample: React.FC<BackgroundImageExampleProps> = ({
    context,
    children,
}) => {
    const {
        getBackgroundImage,
        preloadImages,
        preloadSpecificImage,
        isImageLoaded,
        getImageMetadata,
    } = useBackgroundImage();

    const backgroundUri = getBackgroundImage(context);
    const imageLoaded = isImageLoaded(backgroundUri);
    const metadata = getImageMetadata(backgroundUri);

    useEffect(() => {
        // Preload all images when component mounts
        preloadImages();
    }, [preloadImages]);

    useEffect(() => {
        // Preload the specific image for this context if not already loaded
        if (!imageLoaded) {
            preloadSpecificImage(backgroundUri);
        }
    }, [backgroundUri, imageLoaded, preloadSpecificImage]);

    return (
        <BackgroundImage
            source={{ uri: backgroundUri }}
            overlay={metadata?.overlayRecommended}
            overlayOpacity={metadata?.overlayOpacity}
            style={styles.container}
        >
            <View style={styles.content}>
                {children || (
                    <View style={styles.exampleContent}>
                        <Text style={styles.title}>Background Image Example</Text>
                        <Text style={styles.subtitle}>
                            Context: {context.type}
                            {context.type === 'topic-list' && ` (${context.categoryId})`}
                            {context.type === 'audio-player' && context.topicId && ` (${context.topicId})`}
                        </Text>
                        <Text style={styles.info}>
                            Image loaded: {imageLoaded ? 'Yes' : 'No'}
                        </Text>
                        <Text style={styles.info}>
                            Overlay opacity: {metadata?.overlayOpacity || 'N/A'}
                        </Text>
                    </View>
                )}
            </View>
        </BackgroundImage>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    exampleContent: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
    },
    info: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 5,
        textAlign: 'center',
    },
});

export default BackgroundImageExample;
export { BackgroundImageExample };