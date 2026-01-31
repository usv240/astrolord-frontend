/**
 * Logger Utility Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogger } from './logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLogger', () => {
    it('should create a logger with the given module name', () => {
      const logger = createLogger('TestModule');
      expect(logger).toBeDefined();
      expect(logger.info).toBeInstanceOf(Function);
      expect(logger.warn).toBeInstanceOf(Function);
      expect(logger.error).toBeInstanceOf(Function);
      expect(logger.debug).toBeInstanceOf(Function);
    });

    it('should have all required log methods', () => {
      const logger = createLogger('Test');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('log methods', () => {
    it('should log info messages with correct format', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('InfoTest');
      
      logger.info('Test message', { data: 'test' });
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0];
      // Logger uses emoji format: "ℹ️ INFO [time] [Module] message"
      expect(logCall[0]).toContain('[InfoTest]');
      expect(logCall[0]).toContain('INFO');
      expect(logCall[0]).toContain('Test message');
    });

    it('should log warning messages', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const logger = createLogger('WarnTest');
      
      logger.warn('Warning message');
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0];
      expect(logCall[0]).toContain('[WarnTest]');
      expect(logCall[0]).toContain('WARN');
    });

    it('should log error messages', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logger = createLogger('ErrorTest');
      
      logger.error('Error message', { error: 'details' });
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0];
      expect(logCall[0]).toContain('[ErrorTest]');
      expect(logCall[0]).toContain('ERROR');
    });

    it('should log debug messages', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const logger = createLogger('DebugTest');
      
      logger.debug('Debug message');
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0];
      expect(logCall[0]).toContain('[DebugTest]');
      expect(logCall[0]).toContain('DEBUG');
    });
  });

  describe('log formatting', () => {
    it('should include timestamp in log messages', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('TimestampTest');
      
      logger.info('Test');
      
      const logCall = consoleSpy.mock.calls[0][0];
      // Check for time in the format like "6:21:04 pm"
      expect(logCall).toMatch(/\[\d{1,2}:\d{2}:\d{2}/);
    });

    it('should pass additional arguments to console', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('ArgsTest');
      
      const extraData = { key: 'value', nested: { data: true } };
      logger.info('Message', extraData);
      
      // Logger passes: formatted message, css style, then extra args
      expect(consoleSpy).toHaveBeenCalled();
      const calls = consoleSpy.mock.calls[0];
      expect(calls[0]).toContain('Message');
      // Extra data should be in the arguments
      expect(calls).toContainEqual(extraData);
    });
  });
});
