/**
 * Background Image Performance Monitoring Utilities
 * 
 * This file provides utilities for monitoring and optimizing background image performance
 */

interface ImageLoadMetrics {
    uri: string;
    loadStartTime: number;
    loadEndTime?: number;
    loadDuration?: number;
    size: 'small' | 'medium' | 'large' | 'xlarge';
    success: boolean;
    error?: string;
    cacheHit: boolean;
}

interface PerformanceMetrics {
    totalImages: number;
    successfulLoads: number;
    failedLoads: number;
    averageLoadTime: number;
    cacheHitRate: number;
    memoryUsage: number;
}

class BackgroundImagePerformanceMonitor {
    private metrics: ImageLoadMetrics[] = [];
    private maxMetricsHistory = 100; // Keep last 100 load metrics

    /**
     * Record the start of an image load
     */
    recordLoadStart(uri: string, size: 'small' | 'medium' | 'large' | 'xlarge', cacheHit: boolean = false): void {
        const metric: ImageLoadMetrics = {
            uri,
            loadStartTime: Date.now(),
            size,
            success: false,
            cacheHit,
        };

        this.metrics.push(metric);

        // Keep only recent metrics to prevent memory bloat
        if (this.metrics.length > this.maxMetricsHistory) {
            this.metrics = this.metrics.slice(-this.maxMetricsHistory);
        }
    }

    /**
     * Record the completion of an image load
     */
    recordLoadComplete(uri: string, success: boolean, error?: string): void {
        const metric = this.metrics.find(m => m.uri === uri && !m.loadEndTime);

        if (metric) {
            metric.loadEndTime = Date.now();
            metric.loadDuration = metric.loadEndTime - metric.loadStartTime;
            metric.success = success;
            metric.error = error;
        }
    }

    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics {
        const completedMetrics = this.metrics.filter(m => m.loadEndTime);
        const totalImages = completedMetrics.length;
        const successfulLoads = completedMetrics.filter(m => m.success).length;
        const failedLoads = totalImages - successfulLoads;
        const cacheHits = completedMetrics.filter(m => m.cacheHit).length;

        const loadTimes = completedMetrics
            .filter(m => m.success && m.loadDuration)
            .map(m => m.loadDuration!);

        const averageLoadTime = loadTimes.length > 0
            ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
            : 0;

        const cacheHitRate = totalImages > 0 ? (cacheHits / totalImages) * 100 : 0;

        return {
            totalImages,
            successfulLoads,
            failedLoads,
            averageLoadTime,
            cacheHitRate,
            memoryUsage: this.estimateMemoryUsage(),
        };
    }

    /**
     * Get metrics for a specific image size
     */
    getMetricsBySize(size: 'small' | 'medium' | 'large' | 'xlarge'): ImageLoadMetrics[] {
        return this.metrics.filter(m => m.size === size);
    }

    /**
     * Get slow loading images (above threshold)
     */
    getSlowLoadingImages(thresholdMs: number = 3000): ImageLoadMetrics[] {
        return this.metrics.filter(m =>
            m.loadDuration && m.loadDuration > thresholdMs
        );
    }

    /**
     * Get failed image loads
     */
    getFailedLoads(): ImageLoadMetrics[] {
        return this.metrics.filter(m => !m.success && m.loadEndTime);
    }

    /**
     * Estimate memory usage (rough calculation)
     */
    private estimateMemoryUsage(): number {
        const sizeMultipliers = {
            small: 0.5,   // ~0.5MB
            medium: 1.5,  // ~1.5MB
            large: 3,     // ~3MB
            xlarge: 5,    // ~5MB
        };

        const successfulImages = this.metrics.filter(m => m.success);

        return successfulImages.reduce((total, metric) => {
            return total + (sizeMultipliers[metric.size] || 1);
        }, 0);
    }

    /**
     * Clear old metrics to free memory
     */
    clearOldMetrics(olderThanMs: number = 30 * 60 * 1000): void {
        const cutoffTime = Date.now() - olderThanMs;
        this.metrics = this.metrics.filter(m => m.loadStartTime > cutoffTime);
    }

    /**
     * Get performance recommendations
     */
    getPerformanceRecommendations(): string[] {
        const metrics = this.getPerformanceMetrics();
        const recommendations: string[] = [];

        if (metrics.cacheHitRate < 50) {
            recommendations.push('Consider preloading more frequently used images to improve cache hit rate');
        }

        if (metrics.averageLoadTime > 2000) {
            recommendations.push('Average load time is high - consider using smaller image sizes or better compression');
        }

        if (metrics.failedLoads > metrics.successfulLoads * 0.1) {
            recommendations.push('High failure rate detected - check network connectivity and image URLs');
        }

        if (metrics.memoryUsage > 50) {
            recommendations.push('High memory usage detected - consider more aggressive cache cleanup');
        }

        const slowImages = this.getSlowLoadingImages();
        if (slowImages.length > 0) {
            recommendations.push(`${slowImages.length} images are loading slowly - consider optimizing these specific images`);
        }

        return recommendations;
    }

    /**
     * Log performance summary to console (development only)
     */
    logPerformanceSummary(): void {
        if (__DEV__) {
            const metrics = this.getPerformanceMetrics();
            const recommendations = this.getPerformanceRecommendations();

            console.group('🖼️ Background Image Performance Summary');
            console.log('📊 Metrics:', metrics);

            if (recommendations.length > 0) {
                console.log('💡 Recommendations:', recommendations);
            }

            const slowImages = this.getSlowLoadingImages();
            if (slowImages.length > 0) {
                console.log('🐌 Slow Loading Images:', slowImages.map(m => ({ uri: m.uri, duration: m.loadDuration })));
            }

            const failedImages = this.getFailedLoads();
            if (failedImages.length > 0) {
                console.log('❌ Failed Images:', failedImages.map(m => ({ uri: m.uri, error: m.error })));
            }

            console.groupEnd();
        }
    }
}

// Singleton instance for global performance monitoring
export const backgroundImagePerformanceMonitor = new BackgroundImagePerformanceMonitor();

/**
 * Hook for monitoring background image performance
 */
export const useBackgroundImagePerformance = () => {
    const recordLoadStart = (uri: string, size: 'small' | 'medium' | 'large' | 'xlarge', cacheHit: boolean = false) => {
        backgroundImagePerformanceMonitor.recordLoadStart(uri, size, cacheHit);
    };

    const recordLoadComplete = (uri: string, success: boolean, error?: string) => {
        backgroundImagePerformanceMonitor.recordLoadComplete(uri, success, error);
    };

    const getMetrics = () => backgroundImagePerformanceMonitor.getPerformanceMetrics();

    const logSummary = () => backgroundImagePerformanceMonitor.logPerformanceSummary();

    return {
        recordLoadStart,
        recordLoadComplete,
        getMetrics,
        logSummary,
    };
};

/**
 * Utility to optimize image loading based on network conditions
 */
export const getOptimalImageQuality = (networkType?: string): number => {
    switch (networkType) {
        case 'wifi':
            return 90; // High quality on WiFi
        case '4g':
        case '5g':
            return 80; // Good quality on fast cellular
        case '3g':
            return 60; // Lower quality on slower connections
        case '2g':
        case 'slow-2g':
            return 40; // Very low quality on very slow connections
        default:
            return 80; // Default to good quality
    }
};

/**
 * Utility to determine if image should be preloaded based on context
 */
export const shouldPreloadImage = (context: string, priority: 'high' | 'medium' | 'low' = 'medium'): boolean => {
    // Always preload critical images
    if (context === 'category-screen' || priority === 'high') {
        return true;
    }

    // Preload medium priority images based on available memory
    if (priority === 'medium') {
        const metrics = backgroundImagePerformanceMonitor.getPerformanceMetrics();
        return metrics.memoryUsage < 30; // Only if memory usage is reasonable
    }

    // Only preload low priority images if memory usage is very low
    return backgroundImagePerformanceMonitor.getPerformanceMetrics().memoryUsage < 15;
};