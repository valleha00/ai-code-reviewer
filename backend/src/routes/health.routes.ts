import { Router, Request, Response } from 'express';
import { env } from '../config/env.js';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    providers: {
      openai: Boolean(env.OPENAI_API_KEY),
      anthropic: Boolean(env.ANTHROPIC_API_KEY),
      mock: true,
    },
    version: '1.0.0',
  });
});

export const healthRouter = router;
