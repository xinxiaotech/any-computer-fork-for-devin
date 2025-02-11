import { useState } from 'react';
import { OptimizationConfig } from '../utils/promptOptimizer';
import { usePromptFinderStore } from '../stores/promptFinderStore';
import { runSlowComputer } from '../utils/slowComputer';

interface OptimizationLog {
  timestamp: string;
  message: string;
  response?: string;
  isExpanded?: boolean;
  step?: number;
  substep?: number;
  title?: string;
}

type OptimizationStatus = 'idle' | 'optimizing' | 'error' | 'success';

interface UsePromptOptimizationProps {
  onStreamingStart?: () => void;
  onStreamingEnd?: () => void;
  onError?: (error: Error) => void;
}

export const usePromptOptimization = ({
  onStreamingStart,
  onStreamingEnd,
  onError,
}: UsePromptOptimizationProps = {}) => {
  const addPromptVersion = usePromptFinderStore(state => state.addPromptVersion);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OptimizationStatus>('idle');
  const [logs, setLogs] = useState<OptimizationLog[]>([]);

  const optimizePrompt = async (config: OptimizationConfig) => {
    try {
      setIsOptimizing(true);
      setError(null);
      setStatus('optimizing');
      onStreamingStart?.();

      // Add initial log
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: 'Starting optimization process',
        title: 'Optimization Start',
        step: 1
      }]);

      // Run optimization using slowcomputer
      const result = await runSlowComputer(config);

      // Add versions to store
      result.versions.forEach(version => {
        addPromptVersion(version);
      });

      // Update status and logs
      setStatus('success');
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: 'Optimization completed successfully',
        title: 'Complete',
        step: 2
      }]);

      onStreamingEnd?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('error');
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: `Optimization failed: ${errorMessage}`,
        title: 'Error',
        step: -1
      }]);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    optimizePrompt,
    isOptimizing,
    error,
    status,
    logs,
    setLogs,
  };
};  