import { ILLMProvider } from './base.provider.js';
import { OpenAIProvider } from './openai.provider.js';
import { AnthropicProvider } from './anthropic.provider.js';
import { MockProvider } from './mock.provider.js';
import { env } from '../../config/env.js';
import { AnalyzeRequest } from '../../types/review.types.js';

export class LLMFactory {
  private static openaiProvider = new OpenAIProvider();
  private static anthropicProvider = new AnthropicProvider();
  private static mockProvider = new MockProvider();

  public static getProvider(request: AnalyzeRequest): ILLMProvider {
    const requestedProvider = request.provider || 'auto';
    const hasOpenAIKey = Boolean(request.apiKey || env.OPENAI_API_KEY);
    const hasAnthropicKey = Boolean(request.apiKey || env.ANTHROPIC_API_KEY);

    if (requestedProvider === 'openai') {
      if (hasOpenAIKey) return this.openaiProvider;
      console.warn('OpenAI requested but no API key configured. Falling back to heuristic mock engine.');
      return this.mockProvider;
    }

    if (requestedProvider === 'anthropic') {
      if (hasAnthropicKey) return this.anthropicProvider;
      console.warn('Anthropic requested but no API key configured. Falling back to heuristic mock engine.');
      return this.mockProvider;
    }

    if (requestedProvider === 'mock') {
      return this.mockProvider;
    }

    // Auto mode: prioritize configured live keys, otherwise use mock
    if (hasOpenAIKey) {
      return this.openaiProvider;
    }

    if (hasAnthropicKey) {
      return this.anthropicProvider;
    }

    return this.mockProvider;
  }
}
