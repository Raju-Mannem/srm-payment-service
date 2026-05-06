import type { Request, Response } from 'express';
import { AppError } from '../types/errors';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const globalErrorHandler = (err: Error, req: Request, res: Response) => {
  if (err instanceof AppError) {
    logger.warn({ err, msg: 'Operational error occurred' });
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  logger.error({ err, msg: 'Unhandled exception' });

  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
