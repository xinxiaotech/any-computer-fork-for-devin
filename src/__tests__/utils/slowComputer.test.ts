import { describe, test, expect, vi, beforeEach } from 'vitest';
import { runSlowComputer } from '../../utils/slowComputer';
import type { OptimizationConfig, OptimizationResult } from '../../types/optimization';

describe('runSlowComputer', () => {
  const mockConfig: OptimizationConfig = {
    initialPrompt: 'Hello {{name}}',
    objective: 'Generate a friendly greeting',
    variables: { name: 'World' },
    apiKey: 'test-key'
  };

  const mockResult: OptimizationResult = {
    versions: [{
      id: '1',
      prompt: 'Hello {{name}}',
      result: 'Hello World',
      score: 90,
      evaluation: {
        relativeScore: 100,
        absoluteScore: 90,
        analysis: {
          conceptAlignment: 'Good',
          contextualAccuracy: 'Good',
          completeness: 'Good',
          improvements: 'None needed'
        },
        strengthsAndWeaknesses: 'Strong greeting'
      }
    }]
  };

  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  test('successfully runs optimization', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult)
    });

    const result = await runSlowComputer(mockConfig);

    expect(global.fetch).toHaveBeenCalledWith('/api/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: `npx @slowcomputer/cli run --local '${JSON.stringify(mockConfig)}'`,
      }),
    });

    expect(result).toEqual(mockResult);
    expect(result.versions).toHaveLength(1);
    expect(result.versions[0].score).toBe(90);
  });

  test('handles API error', async () => {
    const errorMessage = 'API error';
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve(errorMessage)
    });

    await expect(runSlowComputer(mockConfig)).rejects.toThrow(
      `SlowComputer optimization failed: ${errorMessage}`
    );
  });

  test('handles invalid response format', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invalid: 'format' })
    });

    await expect(runSlowComputer(mockConfig)).rejects.toThrow(
      'SlowComputer optimization failed: Invalid optimization result format'
    );
  });

  test('handles network error', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(runSlowComputer(mockConfig)).rejects.toThrow(
      'SlowComputer optimization failed: Network error'
    );
  });
});
