import { Router } from 'express';
import { reviewRouter } from './review.routes.js';
import { healthRouter } from './health.routes.js';

const apiV1Router = Router();

apiV1Router.use('/review', reviewRouter);
apiV1Router.use('/', healthRouter);

export default apiV1Router;
