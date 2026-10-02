import Anthropic from '@anthropic-ai/sdk';
import { ILLMProvider } from './base.provider.js';
import { AnalyzeRequest, ReviewResult } from '../../types/review.types.js';
import { ReviewResultSchema } from '../../schemas/review.schema.js';
import { getSystemPrompt } from './prompts.js';
import { env } from '../../config/env.js';

export class AnthropicProvider implements ILLMProvider {
  public readonly name = 'Anthropic Claude';

  public async analyze(request: AnalyzeRequest): Promise<ReviewResult> {
    const startTime = Date.now();
    const apiKey = request.apiKey || env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured or provided.');
    }

    const client = new Anthropic({ apiKey });
    const model = request.model || 'claude-3-5-sonnet-20241022';
    const systemPrompt = `${getSystemPrompt(
      request.language,
      request.focus
    )}\n\nCRITICAL: Respond ONLY with a valid JSON object matching the schema. Do not enclose in markdown blocks, do not include preamble or postamble. Just the JSON object.`;

    const userMessage = `Please review this ${request.language} code focusing on ${request.focus}:\n\n\`\`\`${request.language}\n${request.code}\n\`\`\``;

    const response = await client.messages.create({
      model,
      max_tokens: 3000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const block = response.content[0];
    if (!block || block.type !== 'text') {
      throw new Error('Received unexpected response format from Anthropic');
    }

    let text = block.text.trim();
    // Clean markdown code blocks if model wrapped it
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse Anthropic JSON output: ${text.substring(0, 200)}`);
    }

    const validated = ReviewResultSchema.parse(parsedJson);

    const criticalCount = validated.issues.filter((i) => i.severity === 'critical').length;
    const warningCount = validated.issues.filter((i) => i.severity === 'warning').length;
    const suggestionCount = validated.issues.filter((i) => i.severity === 'suggestion').length;
    const linesOfCode = request.code.split('\n').length;

    return {
      ...validated,
      metadata: {
        provider: 'Anthropic Claude',
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
