import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './prisma/db';
import { redisClient } from './config/redis';
import { setupPaymentWorker } from './jobs/payment.worker';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');
    const worker = setupPaymentWorker();
    const server = app.listen(env.PORT, () => {
      logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await worker.close();
        logger.info('Background worker closed');
        await prisma.$disconnect();
        await redisClient.quit();
        logger.info('Database connections closed');

        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
