import { ILLMProvider } from './base.provider.js';
import { AnalyzeRequest, ReviewIssue, ReviewResult } from '../../types/review.types.js';

export class MockProvider implements ILLMProvider {
  public readonly name = 'Heuristic Engine (Mock)';

  public async analyze(request: AnalyzeRequest): Promise<ReviewResult> {
    const startTime = Date.now();
    // Simulate real AI network latency for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 450));

    const lines = request.code.split('\n');
    const issues: ReviewIssue[] = [];
    const code = request.code;

    // 1. Check for SQL Injection / raw query string interpolation
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || '';
      const lineNum = i + 1;

      // SQL Injection checks
      if (
        (line.includes('SELECT') || line.includes('WHERE') || line.includes('INSERT') || line.includes('UPDATE')) &&
        (line.includes('+') || line.includes('f"') || line.includes('f\'') || line.includes('${') || line.includes('%s')) &&
        !line.includes('?') &&
        !line.includes('$1')
      ) {
        issues.push({
          severity: 'critical',
          line: lineNum,
          title: 'SQL Injection Vulnerability',
          description:
            'Dynamic SQL query constructed via direct string concatenation or interpolation. Attackers can bypass authentication or extract sensitive database contents.',
          patch:
            request.language === 'python'
              ? `cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))`
              : `const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);`,
        });
      }

      // Hardcoded credentials / API keys / secrets
      if (
        /((secret|password|api[_-]?key|token|auth)\s*[:=]\s*["'][A-Za-z0-9_\-]{8,}["'])/i.test(line) &&
        !line.includes('process.env') &&
        !line.includes('os.environ')
      ) {
        issues.push({
          severity: 'critical',
          line: lineNum,
          title: 'Hardcoded Secret / Credential',
          description:
            'Sensitive authentication secret or private key is hardcoded in source code. This exposes credentials if committed to version control.',
          patch:
            request.language === 'python'
              ? `API_KEY = os.environ.get("SERVICE_API_KEY")`
              : `const API_KEY = process.env.SERVICE_API_KEY;`,
        });
      }

      // Python mutable default arguments: def func(a, b=[])
      if (request.language === 'python' && /def\s+\w+\(.*=\s*(\[\]|\{\})\)/.test(line)) {
        issues.push({
          severity: 'warning',
          line: lineNum,
          title: 'Mutable Default Argument',
          description:
            'Default argument value is mutable (list or dict). In Python, default arguments are evaluated once at function definition, causing shared state between invocations.',
          patch: line.replace(/=\s*\[\]/, '= None').replace(/=\s*\{\}/, '= None') +
            `\n    if arg is None:\n        arg = []`,
        });
      }

      // TypeScript / JS: Any type smell
      if (
        (request.language === 'typescript' || request.language === 'javascript') &&
        /:\s*any\b/.test(line)
      ) {
        issues.push({
          severity: 'suggestion',
          line: lineNum,
          title: 'Unsound Type Definition (`any`)',
          description:
            'Using the `any` type disables compile-time type safety and prevents IDE autocompletion. Prefer `unknown`, generic parameters, or explicit interfaces.',
          patch: line.replace(/:\s*any\b/, ': unknown'),
        });
      }

      // TypeScript / JS: dangerouslySetInnerHTML or eval
      if (/eval\(|dangerouslySetInnerHTML/.test(line)) {
        issues.push({
          severity: 'critical',
          line: lineNum,
          title: 'Potential Cross-Site Scripting (XSS) / Code Execution',
          description:
            'Usage of eval() or raw HTML injection permits execution of arbitrary script in client browser or server execution context.',
          patch: `// Sanitize with DOMPurify or parse data safely\nconst safeContent = sanitizeHtml(rawContent);`,
        });
      }

      // Go: Ignored error
      if (request.language === 'go' && /_,\s*err\s*:=/.test(line) && !code.includes('if err != nil')) {
        issues.push({
          severity: 'warning',
          line: lineNum,
          title: 'Unchecked Error Return in Go',
          description:
            'Error return value is assigned but not properly validated before proceeding. In Go, unchecked errors lead to nil-pointer panics or silent corruptions.',
          patch: `if err != nil {\n\treturn fmt.Errorf("failed operation: %w", err)\n}`,
        });
      }

      // Performance: Quadratic nested loop
      if (
        (line.includes('for ') || line.includes('.forEach(') || line.includes('.map(')) &&
        i > 0 &&
        (lines[i - 1]?.includes('for ') || lines[i - 1]?.includes('.forEach('))
      ) {
        issues.push({
          severity: 'warning',
          line: lineNum,
          title: 'Potential O(N²) Computational Bottleneck',
          description:
            'Nested iteration detected. For large collections, this results in quadratic time complexity. Consider indexing elements into a Map or Set for O(1) lookups.',
          patch: `// Pre-index items in a Map for linear O(N) lookup\nconst itemMap = new Map(items.map(item => [item.id, item]));`,
        });
      }

      // Resource leak: unclosed file / missing context manager
      if (request.language === 'python' && line.includes('open(') && !line.includes('with open(')) {
        issues.push({
          severity: 'warning',
          line: lineNum,
          title: 'Unmanaged File Descriptor / Resource Leak',
          description:
            'File opened without a `with` statement context manager. If an exception occurs, the file descriptor will remain open, exhausting OS resources.',
          patch: `with open(filepath, "r", encoding="utf-8") as f:\n    data = f.read()`,
        });
      }
    }

    // Default clean review if no specific heuristic flags were raised
    if (issues.length === 0) {
      if (lines.length <= 4) {
        issues.push({
          severity: 'suggestion',
          line: 1,
          title: 'Minimal Code Snippet',
          description:
            'Code looks clean and concise. For a more comprehensive review, provide complete module context, error handling branches, or tests.',
          patch: '// Ensure proper input validation and error boundaries',
        });
      } else {
        issues.push({
          severity: 'suggestion',
          line: Math.min(2, lines.length),
          title: 'Documentation & Typing Enhancement',
          description:
            'The core logic is structured soundly. Adding JSDoc/docstrings and strict boundary validation will further harden this component for production.',
          patch: `/**\n * Process request with strict error handling\n */`,
        });
      }
    }

    // Calculate score based on issues
    let score = 95;
    for (const issue of issues) {
      if (issue.severity === 'critical') score -= 30;
      else if (issue.severity === 'warning') score -= 15;
      else if (issue.severity === 'suggestion') score -= 5;
    }
    score = Math.max(15, Math.min(98, score));

    // Summary verdict
    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length;

    let summary = '';
    if (criticalCount > 0) {
      summary = `Review identified ${criticalCount} critical vulnerability(ies) that block deployment. Remediation is required to prevent security exploits or catastrophic runtime crashes. Review the patches below before merging.`;
    } else if (warningCount > 0) {
      summary = `The implementation is mostly functional but contains ${warningCount} significant warning(s) concerning reliability or performance. Addressing these recommendations will ensure high availability under production loads.`;
    } else {
      summary = `Excellent code quality! The logic conforms to modern standards and best practices. ${suggestionCount > 0 ? 'Only minor stylistic or typing improvements are recommended.' : 'Ready for merge.'}`;
    }

    return {
      summary,
      score,
      issues,
      metadata: {
        provider: 'Heuristic Engine (Mock)',
        model: 'heuristic-analyzer-v1',
        processingTimeMs: Date.now() - startTime,
        linesOfCode: lines.length,
        criticalCount,
        warningCount,
        suggestionCount,
      },
    };
  }
}
