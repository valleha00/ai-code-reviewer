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

export interface ReviewMetadata {
  provider: string;
  model: string;
  processingTimeMs: number;
  linesOfCode: number;
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
}

export interface ReviewResult {
  summary: string;
  score: number;
  issues: ReviewIssue[];
  metadata?: ReviewMetadata;
}

export interface AnalyzeRequestPayload {
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

export interface ReviewHistoryEntry {
  id: string;
  timestamp: string;
  language: SupportedLanguage;
  focus: ReviewFocus;
  score: number;
  summary: string;
  issuesCount: number;
  code: string;
  result: ReviewResult;
}
