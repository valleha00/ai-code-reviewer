import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const logColor =
      status >= 500
        ? '\x1b[31m' // Red
        : status >= 400
        ? '\x1b[33m' // Yellow
        : status >= 300
        ? '\x1b[36m' // Cyan
        : '\x1b[32m'; // Green
    const reset = '\x1b[0m';

    console.log(
      `[${new Date().toISOString()}] ${logColor}${method} ${originalUrl} ${status}${reset} - ${duration}ms (IP: ${ip})`
    );
  });

  next();
}
