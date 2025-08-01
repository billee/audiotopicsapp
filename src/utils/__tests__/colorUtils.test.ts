import {
  calculateLuminance,
  calculateContrastRatio,
  hexToRgb,
  generateOverlayColors,
  isColorDark,
  getContrastTextColor,
  generateFallbackColor,
} from '../colorUtils';

describe('colorUtils', () => {
  describe('hexToRgb', () => {
    it('converts valid hex colors to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('handles hex colors without # prefix', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('returns null for invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GG0000')).toBeNull();
      expect(hexToRgb('#FF00')).toBeNull();
      expect(hexToRgb('')).toBeNull();
    });

    it('handles lowercase hex colors', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  describe('calculateLuminance', () => {
    it('calculates luminance for pure colors', () => {
      // White should have luminance close to 1
      expect(calculateLuminance(255, 255, 255)).toBeCloseTo(1, 2);
      
      // Black should have luminance close to 0
      expect(calculateLuminance(0, 0, 0)).toBeCloseTo(0, 2);
      
      // Red luminance
      expect(calculateLuminance(255, 0, 0)).toBeCloseTo(0.2126, 2);
      
      // Green luminance
      expect(calculateLuminance(0, 255, 0)).toBeCloseTo(0.7152, 2);
      
      // Blue luminance
      expect(calculateLuminance(0, 0, 255)).toBeCloseTo(0.0722, 2);
    });

    it('calculates luminance for gray colors', () => {
      const gray128 = calculateLuminance(128, 128, 128);
      expect(gray128).toBeGreaterThan(0);
      expect(gray128).toBeLessThan(1);
    });
  });

  describe('calculateContrastRatio', () => {
    it('calculates contrast ratio between black and white', () => {
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0); // Maximum contrast ratio
    });

    it('calculates contrast ratio for same colors', () => {
      const ratio = calculateContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBeCloseTo(1, 2); // Minimum contrast ratio
    });

    it('returns 1 for invalid hex colors', () => {
      expect(calculateContrastRatio('invalid', '#FFFFFF')).toBe(1);
      expect(calculateContrastRatio('#FFFFFF', 'invalid')).toBe(1);
      expect(calculateContrastRatio('invalid', 'invalid')).toBe(1);
    });

    it('calculates reasonable contrast ratios for common color pairs', () => {
      // Dark blue on white should have good contrast
      const darkBlueWhite = calculateContrastRatio('#000080', '#FFFFFF');
      expect(darkBlueWhite).toBeGreaterThan(7); // WCAG AAA compliance
      
      // Light gray on white should have poor contrast
      const lightGrayWhite = calculateContrastRatio('#CCCCCC', '#FFFFFF');
      expect(lightGrayWhite).toBeLessThan(3);
    });
  });

  describe('isColorDark', () => {
    it('identifies dark colors correctly', () => {
      expect(isColorDark('#000000')).toBe(true);
      expect(isColorDark('#333333')).toBe(true);
      expect(isColorDark('#800000')).toBe(true);
      expect(isColorDark('#000080')).toBe(true);
    });

    it('identifies light colors correctly', () => {
      expect(isColorDark('#FFFFFF')).toBe(false);
      expect(isColorDark('#CCCCCC')).toBe(false);
      expect(isColorDark('#FFFF00')).toBe(false);
      expect(isColorDark('#00FFFF')).toBe(false);
    });

    it('handles invalid colors by returning true', () => {
      expect(isColorDark('invalid')).toBe(true);
      expect(isColorDark('')).toBe(true);
    });
  });

  describe('getContrastTextColor', () => {
    it('returns white for dark backgrounds', () => {
      expect(getContrastTextColor('#000000')).toBe('white');
      expect(getContrastTextColor('#333333')).toBe('white');
      expect(getContrastTextColor('#800000')).toBe('white');
    });

    it('returns black for light backgrounds', () => {
      expect(getContrastTextColor('#FFFFFF')).toBe('black');
      expect(getContrastTextColor('#FFFF00')).toBe('black');
      expect(getContrastTextColor('#CCCCCC')).toBe('black');
    });

    it('handles edge cases', () => {
      // Medium gray - should return the color with better contrast
      const result = getContrastTextColor('#808080');
      expect(['white', 'black']).toContain(result);
    });
  });

  describe('generateOverlayColors', () => {
    it('generates appropriate overlay colors for dark images', () => {
      const colors = generateOverlayColors(true);
      expect(colors).toHaveLength(2);
      expect(colors[0]).toContain('rgba(255,255,255'); // Should contain white for dark images
      expect(colors[1]).toContain('rgba(0,0,0'); // Should contain black
    });

    it('generates appropriate overlay colors for light images', () => {
      const colors = generateOverlayColors(false);
      expect(colors).toHaveLength(2);
      expect(colors[0]).toContain('rgba(0,0,0'); // Should contain black for light images
      expect(colors[1]).toContain('rgba(0,0,0'); // Should contain black
    });

    it('returns different colors for dark vs light images', () => {
      const darkColors = generateOverlayColors(true);
      const lightColors = generateOverlayColors(false);
      expect(darkColors).not.toEqual(lightColors);
    });
  });

  describe('generateFallbackColor', () => {
    it('returns default color when no categoryId provided', () => {
      const color = generateFallbackColor();
      expect(color).toBe('#1a1a2e');
    });

    it('returns consistent color for same categoryId', () => {
      const color1 = generateFallbackColor('test-category');
      const color2 = generateFallbackColor('test-category');
      expect(color1).toBe(color2);
    });

    it('returns different colors for different categoryIds', () => {
      const color1 = generateFallbackColor('category-1');
      const color2 = generateFallbackColor('category-2');
      expect(color1).not.toBe(color2);
    });

    it('returns valid hex colors', () => {
      const color = generateFallbackColor('test-category');
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('handles empty string categoryId', () => {
      const color = generateFallbackColor('');
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('handles special characters in categoryId', () => {
      const color = generateFallbackColor('category-with-special-chars!@#$%');
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('generates colors from predefined palette', () => {
      const expectedColors = [
        '#1a1a2e', '#16213e', '#0f3460', '#533483',
        '#7209b7', '#2d1b69', '#11698e', '#19456b'
      ];
      
      // Test multiple category IDs to ensure we get colors from the palette
      const generatedColors = new Set();
      for (let i = 0; i < 20; i++) {
        const color = generateFallbackColor(`category-${i}`);
        generatedColors.add(color);
      }
      
      // All generated colors should be from the expected palette
      generatedColors.forEach(color => {
        expect(expectedColors).toContain(color);
      });
    });
  });

  describe('Color validation', () => {
    it('handles edge cases in color calculations', () => {
      // Test with extreme values
      expect(() => calculateLuminance(0, 0, 0)).not.toThrow();
      expect(() => calculateLuminance(255, 255, 255)).not.toThrow();
      expect(() => calculateLuminance(128, 128, 128)).not.toThrow();
    });

    it('maintains consistency across multiple calls', () => {
      const color = '#FF5733';
      const luminance1 = calculateLuminance(255, 87, 51);
      const luminance2 = calculateLuminance(255, 87, 51);
      expect(luminance1).toBe(luminance2);
      
      const contrast1 = calculateContrastRatio(color, '#FFFFFF');
      const contrast2 = calculateContrastRatio(color, '#FFFFFF');
      expect(contrast1).toBe(contrast2);
    });
  });
});