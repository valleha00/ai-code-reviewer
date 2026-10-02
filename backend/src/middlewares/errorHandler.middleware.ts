import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled Application Error:', err);

  // 1. Zod Validation Error (Bad Request)
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // 2. Timeout error
  if (err.message && err.message.toLowerCase().includes('timed out')) {
    res.status(504).json({
      status: 'error',
      code: 'GATEWAY_TIMEOUT',
      message: 'The AI model analysis timed out. Try analyzing a smaller snippet or selecting a different model.',
    });
    return;
  }

  // 3. Upstream LLM provider error
  if (
    err.message &&
    (err.message.includes('API key') ||
      err.message.includes('OpenAI') ||
      err.message.includes('Anthropic') ||
      err.message.includes('quota') ||
      err.message.includes('rate_limit'))
  ) {
    res.status(502).json({
      status: 'error',
      code: 'LLM_PROVIDER_ERROR',
      message: err.message,
    });
    return;
  }

  // 4. Custom status code
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred during code analysis.',
  });
}
