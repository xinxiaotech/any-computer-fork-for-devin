export interface OptimizationConfig {
  initialPrompt: string;
  objective: string;
  variables: Record<string, any>;
  apiKey: string;
}

export interface EvaluationData {
  relativeScore: number;  // Percentage score relative to best version in group
  absoluteScore: number;  // Raw evaluation score from 0-100
  analysis: {
    conceptAlignment: string;    // How well core concepts align
    contextualAccuracy: string;  // Accuracy of context and domain details
    completeness: string;        // Coverage of expected details
    improvements: string;      // Specific improvement suggestions
  };
  strengthsAndWeaknesses: string;     // Strengths and weaknesses analysis
  parentComparison?: string;     // Comparison with parent version if exists
}

export interface PromptVersionWithEvaluation {
  id: string;
  prompt: string;
  result: string;
  score: number;
  parentId?: string;
  feedback?: string;
  evaluation?: EvaluationData;
  rawEvaluationResult?: string;
  explanation?: string;
  position?: { x: number; y: number };
  versionName?: string;
}

export interface OptimizationResult {
  versions: PromptVersionWithEvaluation[];
  error?: string;
}
