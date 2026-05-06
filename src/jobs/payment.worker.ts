import { Worker, type Job } from 'bullmq';
import { redisClient } from '../config/redis';
import { GatewayFactory } from '../services/gateways/gateway.factory';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentStatus } from '../generated/prisma/client';
import { logger } from '../config/logger';

export const setupPaymentWorker = () => {
  const worker = new Worker(
    'PaymentQueue',
    async (job: Job) => {
      const { paymentId, provider } = job.data;
      logger.info(
        { provider, paymentId, attempt: job.attemptsMade + 1 },
        'Worker processing payment'
      );

      if (job.attemptsMade === 0) {
        await PaymentRepository.updatePaymentStatusSafe(paymentId, PaymentStatus.PROCESSING);
      }

      const gateway = GatewayFactory.getGateway(provider);
      const result = await gateway.processPayment(job.data.amount, job.data.currency);

      if (result.status === 'SUCCESS') {
        await PaymentRepository.updatePaymentStatusSafe(paymentId, PaymentStatus.SUCCESS);
        logger.info({ paymentId }, 'Payment successful via worker');
      } else {
        await PaymentRepository.updatePaymentStatusSafe(
          paymentId,
          PaymentStatus.FAILED,
          result.reason
        );
        logger.warn({ paymentId, reason: result.reason }, 'Payment failed via worker');
      }
    },
    {
      connection: redisClient,
      concurrency: 5,
    }
  );

  worker.on('failed', async (job, err) => {
    if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
      logger.error(
        { paymentId: job.data.paymentId, err: err.message },
        'Payment job permanently failed after retries'
      );

      await PaymentRepository.updatePaymentStatusSafe(
        job.data.paymentId,
        PaymentStatus.FAILED,
        'System Error: Gateway unreachable after retries'
      );
    }
  });

  logger.info('Payment Worker initialized and listening to queue');
  return worker;
};
