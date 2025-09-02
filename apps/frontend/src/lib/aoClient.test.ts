/**
 * AO Client Tests
 * Tests the AO client integration without mock data
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  aoDryrun,
  aoMessage,
  getAllProposals,
  getSystemInfo,
} from './aoClient';

// Mock @permaweb/aoconnect
vi.mock('@permaweb/aoconnect', () => ({
  dryrun: vi.fn(),
  message: vi.fn(),
  result: vi.fn(),
  createDataItemSigner: vi.fn(),
}));

// Mock GENIE_PROCESS
vi.mock('@/constants/genie_process', () => ({
  GENIE_PROCESS: 'test-process-id',
}));

// Mock toast
vi.mock('@/lib/toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('AO Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('aoDryrun', () => {
    it('should call dryrun with correct parameters', async () => {
      const { dryrun } = await import('@permaweb/aoconnect');
      const mockDryrun = dryrun as any;

      mockDryrun.mockResolvedValue({
        Messages: [
          {
            Tags: [{ name: 'Action', value: 'TestAction-Response' }],
            Data: '{"test":"data"}',
          },
        ],
      });

      const result = await aoDryrun('TestAction', { test: 'data' });

      expect(mockDryrun).toHaveBeenCalledWith({
        process: 'test-process-id',
        tags: [{ name: 'Action', value: 'TestAction' }],
        data: '{"test":"data"}',
      });
      expect(result).toEqual({ test: 'data' });
    });

    it('should handle empty response', async () => {
      const { dryrun } = await import('@permaweb/aoconnect');
      const mockDryrun = dryrun as any;

      mockDryrun.mockResolvedValue({
        Messages: [],
      });

      const promise = aoDryrun('GetAllProposals');

      // Fast-forward through any potential retries
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('No messages in response');
    });

    it('should retry on network errors', async () => {
      const { dryrun } = await import('@permaweb/aoconnect');
      const mockDryrun = dryrun as any;

      // First two calls fail, third succeeds
      mockDryrun
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockRejectedValueOnce(new Error('503 Service Unavailable'))
        .mockResolvedValue({
          Messages: [
            {
              Tags: [{ name: 'Action', value: 'TestAction-Response' }],
              Data: '{"success":true}',
            },
          ],
        });

      const promise = aoDryrun('TestAction');

      // Fast-forward through retries
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(mockDryrun).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });

    it('should not retry on wallet errors', async () => {
      const { dryrun } = await import('@permaweb/aoconnect');
      const mockDryrun = dryrun as any;

      mockDryrun.mockRejectedValue(new Error('Arweave wallet not available'));

      await expect(aoDryrun('TestAction')).rejects.toThrow(
        'Arweave wallet not available'
      );
      expect(mockDryrun).toHaveBeenCalledTimes(1);
    });

    it('should handle CORS errors with user-friendly message', async () => {
      const { dryrun } = await import('@permaweb/aoconnect');
      const mockDryrun = dryrun as any;

      mockDryrun.mockRejectedValue(new Error('CORS policy blocked'));

      const promise = aoDryrun('TestAction');

      // Fast-forward through retries
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(
        'Network access blocked. Please check your connection and try again.'
      );
    });

    it('should handle 503 errors with user-friendly message', async () => {
      const { dryrun } = await import('@permaweb/aoconnect');
      const mockDryrun = dryrun as any;

      mockDryrun.mockRejectedValue(new Error('503 Service Unavailable'));

      const promise = aoDryrun('TestAction');

      // Fast-forward through retries
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(
        'AO service temporarily unavailable. Please try again later.'
      );
    });
  });

  describe('aoMessage', () => {
    it('should call message and result with correct parameters', async () => {
      const {
        message,
        result: resultFn,
        createDataItemSigner,
      } = await import('@permaweb/aoconnect');
      const mockMessage = message as any;
      const mockResult = resultFn as any;
      const mockSigner = createDataItemSigner as any;

      // Mock wallet
      Object.defineProperty(window, 'arweaveWallet', {
        value: { sign: vi.fn() },
        writable: true,
      });

      mockSigner.mockReturnValue('mock-signer');
      mockMessage.mockResolvedValue('message-id-123');
      mockResult.mockResolvedValue({
        Messages: [
          {
            Tags: [{ name: 'Action', value: 'TestAction-Response' }],
            Data: '{"success":true}',
          },
        ],
      });

      const result = await aoMessage('TestAction', { test: 'data' });

      expect(mockMessage).toHaveBeenCalledWith({
        process: 'test-process-id',
        tags: [{ name: 'Action', value: 'TestAction' }],
        data: '{"test":"data"}',
        signer: 'mock-signer',
      });
      expect(mockResult).toHaveBeenCalledWith({
        message: 'message-id-123',
        process: 'test-process-id',
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw error when wallet is not available', async () => {
      // Remove wallet from window
      Object.defineProperty(window, 'arweaveWallet', {
        value: undefined,
        writable: true,
      });

      await expect(aoMessage('TestAction')).rejects.toThrow(
        'Arweave wallet not available. Please connect your wallet first.'
      );
    });
  });

  describe('getAllProposals', () => {
    it('should return proposals array', async () => {
      const { dryrun } = await import('@permaweb/aoconnect');
      const mockDryrun = dryrun as any;

      mockDryrun.mockResolvedValue({
        Messages: [
          {
            Tags: [{ name: 'Action', value: 'AllProposalsRetrieved' }],
            Data: '{"Proposals":[{"id":"1","title":"Proposal 1"},{"id":"2","title":"Proposal 2"}]}',
          },
        ],
      });

      const result = await getAllProposals();

      expect(mockDryrun).toHaveBeenCalledWith({
        process: 'test-process-id',
        tags: [{ name: 'Action', value: 'GetAllProposals' }],
        data: undefined,
      });
      expect(result).toEqual([
        { id: '1', title: 'Proposal 1' },
        { id: '2', title: 'Proposal 2' },
      ]);
    });

    it('should handle response without Proposals key', async () => {
      const { dryrun } = await import('@permaweb/aoconnect');
      const mockDryrun = dryrun as any;

      mockDryrun.mockResolvedValue({
        Messages: [
          {
            Tags: [{ name: 'Action', value: 'AllProposalsRetrieved' }],
            Data: '[{"id":"1","title":"Proposal 1"}]',
          },
        ],
      });

      const result = await getAllProposals();

      expect(result).toEqual([{ id: '1', title: 'Proposal 1' }]);
    });
  });

  describe('getSystemInfo', () => {
    it('should call Info action', async () => {
      const { dryrun } = await import('@permaweb/aoconnect');
      const mockDryrun = dryrun as any;

      mockDryrun.mockResolvedValue({
        Messages: [
          {
            Tags: [{ name: 'Action', value: 'Info-Response' }],
            Data: '{"version":"1.0.0","status":"healthy"}',
          },
        ],
      });

      const result = await getSystemInfo();

      expect(mockDryrun).toHaveBeenCalledWith({
        process: 'test-process-id',
        tags: [{ name: 'Action', value: 'Info' }],
        data: undefined,
      });
      expect(result).toEqual({ version: '1.0.0', status: 'healthy' });
    });
  });
});
