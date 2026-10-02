export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'php'
  | 'ruby'
  | 'sql'
  | 'shell';

export type ReviewFocus =
  | 'security'
  | 'performance'
  | 'clean_code'
  | 'bug_prevention'
  | 'architecture';

export type IssueSeverity = 'critical' | 'warning' | 'suggestion';

export interface ReviewIssue {
  severity: IssueSeverity;
  line: number;
  title: string;
  description: string;
  patch: string;
}

export interface ReviewResult {
  summary: string;
  score: number;
  issues: ReviewIssue[];
  metadata?: {
    provider: string;
    model: string;
    processingTimeMs: number;
    linesOfCode: number;
    criticalCount: number;
    warningCount: number;
    suggestionCount: number;
  };
}

export interface AnalyzeRequest {
  code: string;
  language: SupportedLanguage;
  focus: ReviewFocus;
  provider?: 'openai' | 'anthropic' | 'mock' | 'auto';
  model?: string;
  apiKey?: string;
}

export interface CodePreset {
  id: string;
  title: string;
  language: SupportedLanguage;
  focus: ReviewFocus;
  description: string;
  code: string;
}
