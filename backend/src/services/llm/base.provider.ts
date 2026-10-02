import { AnalyzeRequest, ReviewResult } from '../../types/review.types.js';

export interface ILLMProvider {
  readonly name: string;
  analyze(request: AnalyzeRequest): Promise<ReviewResult>;
}
