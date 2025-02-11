import { OptimizationConfig, OptimizationResult } from '../utils/promptOptimizer';

export const runSlowComputer = async (config: OptimizationConfig): Promise<OptimizationResult> => {
  try {
    // Run the slowcomputer CLI command through a shell script
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: `npx @slowcomputer/cli run --local '${JSON.stringify(config)}'`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SlowComputer CLI error:', error);
      throw new Error(error);
    }

    // Parse and validate the result
    const result = await response.json() as OptimizationResult;
    if (!result || !Array.isArray(result.versions)) {
      throw new Error('Invalid optimization result format');
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error running slowcomputer';
    throw new Error(`SlowComputer optimization failed: ${errorMessage}`);
  }
};
