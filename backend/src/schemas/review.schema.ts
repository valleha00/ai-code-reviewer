import { z } from 'zod';

export const SupportedLanguageEnum = z.enum([
  'typescript',
  'javascript',
  'python',
  'go',
  'rust',
  'java',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'sql',
  'shell',
]);

export const ReviewFocusEnum = z.enum([
  'security',
  'performance',
  'clean_code',
  'bug_prevention',
  'architecture',
]);

export const IssueSeverityEnum = z.enum(['critical', 'warning', 'suggestion']);

export const ReviewIssueSchema = z.object({
  severity: IssueSeverityEnum,
  line: z.number().int().min(1, 'Line number must be >= 1'),
  title: z.string().min(3, 'Title is too short'),
  description: z.string().min(5, 'Description is too short'),
  patch: z.string(),
});

export const ReviewResultSchema = z.object({
  summary: z.string().min(10, 'Summary is too short'),
  score: z.number().int().min(0).max(100),
  issues: z.array(ReviewIssueSchema),
  metadata: z
    .object({
      provider: z.string(),
      model: z.string(),
      processingTimeMs: z.number(),
      linesOfCode: z.number(),
      criticalCount: z.number(),
      warningCount: z.number(),
      suggestionCount: z.number(),
    })
    .optional(),
});

export const AnalyzeRequestSchema = z.object({
  code: z
    .string({ required_error: 'Code snippet is required' })
    .min(3, 'Code snippet must contain at least 3 characters')
    .max(100000, 'Code snippet exceeds maximum length of 100,000 characters'),
  language: SupportedLanguageEnum.default('typescript'),
  focus: ReviewFocusEnum.default('clean_code'),
  provider: z.enum(['openai', 'anthropic', 'mock', 'auto']).default('auto'),
  model: z.string().optional(),
  apiKey: z.string().optional(),
});

export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;
export type ReviewResultOutput = z.infer<typeof ReviewResultSchema>;
