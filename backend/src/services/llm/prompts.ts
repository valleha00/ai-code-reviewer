import { ReviewFocus, SupportedLanguage } from '../../types/review.types.js';

export const REVIEW_JSON_SCHEMA = {
  name: 'code_review_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
        description: 'Comprehensive high-level verdict and assessment of the reviewed code.',
      },
      score: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
        description: 'Code quality score from 0 (critical failure) to 100 (flawless production grade).',
      },
      issues: {
        type: 'array',
        description: 'List of detected issues, vulnerabilities, and improvements.',
        items: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              enum: ['critical', 'warning', 'suggestion'],
              description: 'Severity level: critical (security/data loss/crashes), warning (performance/bugs), suggestion (clean code/best practices).',
            },
            line: {
              type: 'integer',
              minimum: 1,
              description: 'Approximate 1-based line number in the submitted code where the issue resides.',
            },
            title: {
              type: 'string',
              description: 'Concise summary title of the issue (e.g., SQL Injection Vulnerability).',
            },
            description: {
              type: 'string',
              description: 'Detailed explanation of why this is a bug, vulnerability, or anti-pattern.',
            },
            patch: {
              type: 'string',
              description: 'A direct, production-ready replacement snippet of code solving this issue.',
            },
          },
          required: ['severity', 'line', 'title', 'description', 'patch'],
          additionalProperties: false,
        },
      },
    },
    required: ['summary', 'score', 'issues'],
    additionalProperties: false,
  },
};

export function getSystemPrompt(language: SupportedLanguage, focus: ReviewFocus): string {
  const focusGuidelines: Record<ReviewFocus, string> = {
    security: `
PRIORITY: Extreme focus on Security (OWASP Top 10, CWE, Secret Leaks, Auth Bypass, SQLi, XSS, SSRF, Deserialization, Memory Safety).
- Identify any untrusted input handling, SQL string interpolation, shell executions, timing attacks, insecure defaults.
- Any security vulnerability MUST be classified as "critical".
- Provide bulletproof remediation patches avoiding partial sanitization.`,

    performance: `
PRIORITY: Extreme focus on Performance & Scalability (Computational Complexity, I/O bottlenecks, N+1 queries, memory leaks, blocking event loops, unneeded allocations).
- Highlight quadratic O(n^2) operations, missing batching, excessive serialization, database connection leaks.
- Severity should be "critical" for memory leaks or event loop freezes, and "warning" for sub-optimal iterations.
- Provide optimized algorithmic or asynchronous patches with benchmarks or complexity explanations in description.`,

    clean_code: `
PRIORITY: Extreme focus on Clean Code & Maintainability (SOLID principles, DRY, KISS, YAGNI, naming conventions, cognitive complexity, modularity, strict typing).
- Detect antipatterns, god functions, magic numbers, implicit any types, deeply nested conditionals, missing abstractions.
- Suggest readable, self-documenting, idiomatic refactorings.`,

    bug_prevention: `
PRIORITY: Extreme focus on Bug Prevention & Reliability (Null/undefined dereferencing, race conditions, edge-cases, off-by-one errors, unhandled promise rejections, type safety).
- Scrutinize error handling, edge cases (empty collections, zero divisors, unicode, concurrent state mutations).
- Provide defensive coding patches.`,

    architecture: `
PRIORITY: Extreme focus on Architectural Design (Separation of concerns, dependency inversion, domain boundaries, abstraction leaks, testability).
- Scrutinize cohesion, tight coupling to concrete implementations, lack of interfaces or repository layers.
- Provide modular refactoring patches.`,
  };

  return `You are a Principal Software Engineer and Staff Security Architect performing an elite, uncompromising Pull Request Code Review.
Target Language: ${language.toUpperCase()}
Review Objective: ${focus.toUpperCase()}

${focusGuidelines[focus]}

Review Rules:
1. Be objective, precise, and constructive. Do not hallucinate line numbers or non-existent syntax errors.
2. Return strictly valid JSON conforming to the schema.
3. Every issue MUST include:
   - "severity": "critical" | "warning" | "suggestion"
   - "line": accurate 1-indexed line number in the submitted code
   - "title": punchy, clear headline
   - "description": deep rationale explaining why this creates a risk/bug/debt and how the patch resolves it
   - "patch": concise, ready-to-paste replacement code snippet with context
4. Score criteria:
   - 90-100: Production-grade, zero critical issues, clean idiomatic patterns.
   - 70-89: Good, but has minor warnings or optimization opportunities.
   - 40-69: Noticeable defects, potential memory/performance leaks, or code smell.
   - 0-39: Severe critical security vulnerabilities, crashes, or severe data loss risks.
5. If the code is already excellent, return high score (90-98), a complimentary summary, and empty issues list or 1 minor suggestion.
`;
}
