import { Queue } from 'bullmq';
import { redisClient } from '../config/redis';

export const paymentQueue = new Queue('PaymentQueue', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
