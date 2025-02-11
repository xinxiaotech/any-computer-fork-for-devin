import { exec } from 'child_process';
import { promisify } from 'util';
import { OptimizationConfig, OptimizationResult } from '../utils/promptOptimizer';

const execAsync = promisify(exec);

export const runSlowComputer = async (config: OptimizationConfig): Promise<OptimizationResult> => {
  try {
    // Run the slowcomputer CLI command
    const { stdout, stderr } = await execAsync(
      `npx @slowcomputer/cli run --local '${JSON.stringify(config)}'`
    );

    if (stderr) {
      console.error('SlowComputer CLI error:', stderr);
      throw new Error(stderr);
    }

    // Parse and validate the result
    const result = JSON.parse(stdout) as OptimizationResult;
    if (!result || !Array.isArray(result.versions)) {
      throw new Error('Invalid optimization result format');
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error running slowcomputer';
    throw new Error(`SlowComputer optimization failed: ${errorMessage}`);
  }
};
