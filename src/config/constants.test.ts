/**
 * Constants Configuration Tests
 */

import { describe, it, expect } from 'vitest';
import {
  DURATIONS,
  POLLING,
  CACHE,
  LIMITS,
  API,
  STORAGE_KEYS,
  BREAKPOINTS,
  COLORS,
  ZODIAC,
} from './constants';

describe('Constants', () => {
  describe('DURATIONS', () => {
    it('should have valid animation durations', () => {
      expect(DURATIONS.ANIMATION_FAST).toBeLessThan(DURATIONS.ANIMATION_NORMAL);
      expect(DURATIONS.ANIMATION_NORMAL).toBeLessThan(DURATIONS.ANIMATION_SLOW);
    });

    it('should have sensible debounce values', () => {
      expect(DURATIONS.DEBOUNCE_SEARCH).toBeGreaterThan(0);
      expect(DURATIONS.DEBOUNCE_FORM_SAVE).toBeGreaterThanOrEqual(DURATIONS.DEBOUNCE_SEARCH);
    });

    it('should have undo timeout greater than toast duration', () => {
      expect(DURATIONS.UNDO_TIMEOUT).toBeGreaterThanOrEqual(DURATIONS.TOAST_DEFAULT);
    });
  });

  describe('POLLING', () => {
    it('should have all required polling intervals', () => {
      expect(POLLING.SUBSCRIPTION_STATUS).toBeDefined();
      expect(POLLING.LIVE_STATS).toBeDefined();
      expect(POLLING.CHAT_UPDATES).toBeDefined();
    });

    it('should have reasonable polling intervals', () => {
      // Live stats should be fast but not too fast
      expect(POLLING.LIVE_STATS).toBeGreaterThanOrEqual(1000);
      expect(POLLING.LIVE_STATS).toBeLessThanOrEqual(30000);
      
      // Subscription can be checked less frequently
      expect(POLLING.SUBSCRIPTION_STATUS).toBeGreaterThan(POLLING.LIVE_STATS);
    });
  });

  describe('CACHE', () => {
    it('should have stale time less than gc time', () => {
      expect(CACHE.STALE_TIME).toBeLessThan(CACHE.GC_TIME);
    });

    it('should have proper time hierarchy', () => {
      expect(CACHE.STALE_TIME_SHORT).toBeLessThan(CACHE.STALE_TIME);
      expect(CACHE.STALE_TIME).toBeLessThan(CACHE.STALE_TIME_LONG);
    });
  });

  describe('LIMITS', () => {
    it('should have sensible chat message limit', () => {
      expect(LIMITS.CHAT_MESSAGE_MAX).toBeGreaterThan(100);
      expect(LIMITS.CHAT_MESSAGE_MAX).toBeLessThanOrEqual(10000);
    });

    it('should have proper page size hierarchy', () => {
      expect(LIMITS.PAGE_SIZE_SMALL).toBeLessThan(LIMITS.PAGE_SIZE_DEFAULT);
      expect(LIMITS.PAGE_SIZE_DEFAULT).toBeLessThan(LIMITS.PAGE_SIZE_LARGE);
    });

    it('should have reasonable file upload limit', () => {
      // Should be at least 1MB
      expect(LIMITS.FILE_UPLOAD_MAX).toBeGreaterThanOrEqual(1024 * 1024);
      // Should not exceed 100MB
      expect(LIMITS.FILE_UPLOAD_MAX).toBeLessThanOrEqual(100 * 1024 * 1024);
    });
  });

  describe('API', () => {
    it('should have retry count between 1 and 5', () => {
      expect(API.RETRY_COUNT).toBeGreaterThanOrEqual(1);
      expect(API.RETRY_COUNT).toBeLessThanOrEqual(5);
    });

    it('should have request timeout greater than 5 seconds', () => {
      expect(API.REQUEST_TIMEOUT).toBeGreaterThanOrEqual(5000);
    });

    it('should have upload timeout greater than request timeout', () => {
      expect(API.UPLOAD_TIMEOUT).toBeGreaterThanOrEqual(API.REQUEST_TIMEOUT);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have unique storage keys', () => {
      const values = Object.values(STORAGE_KEYS);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });

    it('should have required auth keys', () => {
      expect(STORAGE_KEYS.AUTH_TOKEN).toBeDefined();
      expect(STORAGE_KEYS.USER).toBeDefined();
    });
  });

  describe('BREAKPOINTS', () => {
    it('should have increasing breakpoint values', () => {
      expect(BREAKPOINTS.SM).toBeLessThan(BREAKPOINTS.MD);
      expect(BREAKPOINTS.MD).toBeLessThan(BREAKPOINTS.LG);
      expect(BREAKPOINTS.LG).toBeLessThan(BREAKPOINTS.XL);
      expect(BREAKPOINTS.XL).toBeLessThan(BREAKPOINTS['2XL']);
    });
  });

  describe('COLORS', () => {
    it('should have valid hex colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      
      expect(COLORS.PRIMARY).toMatch(hexRegex);
      expect(COLORS.SECONDARY).toMatch(hexRegex);
      expect(COLORS.SUCCESS).toMatch(hexRegex);
      expect(COLORS.ERROR).toMatch(hexRegex);
    });
  });

  describe('ZODIAC', () => {
    it('should have 12 zodiac signs', () => {
      expect(ZODIAC.SIGNS).toHaveLength(12);
    });

    it('should have 9 Vedic planets', () => {
      expect(ZODIAC.PLANETS).toHaveLength(9);
    });

    it('should have 12 houses', () => {
      expect(ZODIAC.HOUSES).toHaveLength(12);
    });

    it('should have Aries as first sign', () => {
      expect(ZODIAC.SIGNS[0]).toBe('Aries');
    });

    it('should include Rahu and Ketu (Vedic)', () => {
      expect(ZODIAC.PLANETS).toContain('Rahu');
      expect(ZODIAC.PLANETS).toContain('Ketu');
    });
  });
});
