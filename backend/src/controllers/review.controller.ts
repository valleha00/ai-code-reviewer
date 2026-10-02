import { Request, Response, NextFunction } from 'express';
import { AnalyzeRequestSchema } from '../schemas/review.schema.js';
import { ReviewService } from '../services/review.service.js';

export class ReviewController {
  public static async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = AnalyzeRequestSchema.parse(req.body);
      const reviewResult = await ReviewService.analyze(validatedInput);

      res.status(200).json(reviewResult);
    } catch (error) {
      next(error);
    }
  }

  public static getPresets(_req: Request, res: Response): void {
    const presets = ReviewService.getPresets();
    res.status(200).json({ presets });
  }

  public static getHistory(_req: Request, res: Response): void {
    const history = ReviewService.getHistory();
    res.status(200).json({ history });
  }
}
