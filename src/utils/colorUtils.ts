/**
 * Utility functions for color manipulation and contrast calculations
 */

/**
 * Calculate the luminance of a color
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Luminance value (0-1)
 */
export const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * @param color1 First color in hex format (#RRGGBB)
 * @param color2 Second color in hex format (#RRGGBB)
 * @returns Contrast ratio (1-21)
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Convert hex color to RGB
 * @param hex Hex color string (#RRGGBB or #RGB)
 * @returns RGB object or null if invalid
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Generate appropriate overlay colors based on image brightness
 * @param isDark Whether the background image is predominantly dark
 * @returns Array of gradient colors for overlay
 */
export const generateOverlayColors = (isDark: boolean): string[] => {
  if (isDark) {
    // For dark images, use lighter overlay to ensure text readability
    return ['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.4)'];
  } else {
    // For light images, use darker overlay
    return ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'];
  }
};

/**
 * Determine if a color is considered dark
 * @param hex Hex color string
 * @returns True if the color is dark
 */
export const isColorDark = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  
  const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
  return luminance < 0.5;
};

/**
 * Get appropriate text color based on background
 * @param backgroundHex Background color in hex
 * @returns 'white' or 'black' for optimal contrast
 */
export const getContrastTextColor = (backgroundHex: string): 'white' | 'black' => {
  const whiteContrast = calculateContrastRatio(backgroundHex, '#FFFFFF');
  const blackContrast = calculateContrastRatio(backgroundHex, '#000000');
  
  return whiteContrast > blackContrast ? 'white' : 'black';
};

/**
 * Generate fallback colors based on category or content type
 * @param categoryId Category identifier
 * @returns Hex color string
 */
export const generateFallbackColor = (categoryId?: string): string => {
  const fallbackColors = [
    '#1a1a2e', // Dark blue
    '#16213e', // Navy
    '#0f3460', // Deep blue
    '#533483', // Purple
    '#7209b7', // Violet
    '#2d1b69', // Dark purple
    '#11698e', // Teal
    '#19456b', // Steel blue
  ];
  
  if (!categoryId) {
    return fallbackColors[0];
  }
  
  // Generate consistent color based on category ID
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % fallbackColors.length;
  return fallbackColors[index];
};