import OpenAI from 'openai';
import { ILLMProvider } from './base.provider.js';
import { AnalyzeRequest, ReviewResult } from '../../types/review.types.js';
import { ReviewResultSchema } from '../../schemas/review.schema.js';
import { getSystemPrompt, REVIEW_JSON_SCHEMA } from './prompts.js';
import { env } from '../../config/env.js';

export class OpenAIProvider implements ILLMProvider {
  public readonly name = 'OpenAI';

  public async analyze(request: AnalyzeRequest): Promise<ReviewResult> {
    const startTime = Date.now();
    const apiKey = request.apiKey || env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured or provided.');
    }

    const client = new OpenAI({ apiKey });
    const model = request.model || 'gpt-4o-mini';
    const systemPrompt = getSystemPrompt(request.language, request.focus);

    const userMessage = `Please review this ${request.language} code focusing on ${request.focus}:\n\n\`\`\`${request.language}\n${request.code}\n\`\`\``;

    const response = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: REVIEW_JSON_SCHEMA,
      },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    const choice = response.choices[0];
    const content = choice?.message?.content;

    if (!content) {
      throw new Error('Received empty response from OpenAI');
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(content);
    } catch {
      throw new Error(`Failed to parse OpenAI JSON output: ${content.substring(0, 200)}`);
    }

    const validated = ReviewResultSchema.parse(parsedJson);

    const criticalCount = validated.issues.filter((i) => i.severity === 'critical').length;
    const warningCount = validated.issues.filter((i) => i.severity === 'warning').length;
    const suggestionCount = validated.issues.filter((i) => i.severity === 'suggestion').length;
    const linesOfCode = request.code.split('\n').length;

    return {
      ...validated,
      metadata: {
        provider: 'OpenAI',
        model,
        processingTimeMs: Date.now() - startTime,
        linesOfCode,
        criticalCount,
        warningCount,
        suggestionCount,
      },
    };
  }
}
