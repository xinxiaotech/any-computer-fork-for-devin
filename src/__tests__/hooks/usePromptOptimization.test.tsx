import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePromptOptimization } from '../../hooks/usePromptOptimization';
import { runSlowComputer } from '../../utils/slowComputer';
import type { OptimizationConfig } from '../../types/optimization';

// Mock the slowComputer utility
vi.mock('../../utils/slowComputer', () => ({
  runSlowComputer: vi.fn()
}));

describe('usePromptOptimization', () => {
  const mockConfig: OptimizationConfig = {
    initialPrompt: 'Hello {{name}}',
    objective: 'Generate a friendly greeting',
    variables: { name: 'World' },
    apiKey: 'test-key'
  };

  const mockResult = {
    versions: [{
      id: '1',
      prompt: 'Hello {{name}}',
      result: 'Hello World',
      score: 90
    }]
  };

  const mockCallbacks = {
    onStreamingStart: vi.fn(),
    onStreamingEnd: vi.fn(),
    onError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (runSlowComputer as any).mockReset();
  });

  test('handles successful optimization', async () => {
    (runSlowComputer as any).mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => usePromptOptimization(mockCallbacks));

    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('idle');

    await act(async () => {
      await result.current.optimizePrompt(mockConfig);
    });

    expect(mockCallbacks.onStreamingStart).toHaveBeenCalled();
    expect(mockCallbacks.onStreamingEnd).toHaveBeenCalled();
    expect(mockCallbacks.onError).not.toHaveBeenCalled();
    expect(result.current.status).toBe('success');
    expect(result.current.logs).toHaveLength(2);
  });

  test('handles optimization error', async () => {
    const error = new Error('Optimization failed');
    (runSlowComputer as any).mockRejectedValueOnce(error);

    const { result } = renderHook(() => usePromptOptimization(mockCallbacks));

    await act(async () => {
      try {
        await result.current.optimizePrompt(mockConfig);
      } catch (e) {
        // Error is expected
      }
    });

    expect(mockCallbacks.onStreamingStart).toHaveBeenCalled();
    expect(mockCallbacks.onStreamingEnd).not.toHaveBeenCalled();
    expect(mockCallbacks.onError).toHaveBeenCalledWith(error);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error.message);
  });

  test('updates logs during optimization', async () => {
    (runSlowComputer as any).mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => usePromptOptimization(mockCallbacks));

    await act(async () => {
      await result.current.optimizePrompt(mockConfig);
    });

    expect(result.current.logs[0]).toMatchObject({
      message: 'Starting optimization process',
      title: 'Optimization Start',
      step: 1
    });

    expect(result.current.logs[1]).toMatchObject({
      message: 'Optimization completed successfully',
      title: 'Complete',
      step: 2
    });
  });
});
