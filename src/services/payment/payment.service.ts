import { PaymentStatus } from '../../generated/prisma/client';
import { PaymentRepository } from '../../repositories/payment.repository';
import { paymentQueue } from '../../jobs/payment.queue';
import { checkIdempotency, cacheIdempotency } from '../../utils/idempotency';
import { logger } from '../../config/logger';
import type { PaymentProvider } from '../../generated/prisma/enums';

export class PaymentService {
  static async initiatePayment(
    provider: PaymentProvider,
    amount: number,
    currency: string,
    idempotencyKey: string
  ) {
    const cachedResponse = await checkIdempotency(idempotencyKey);
    if (cachedResponse) {
      logger.info({ idempotencyKey }, 'Idempotency hit: Returning cached response');
      return JSON.parse(cachedResponse);
    }

    const payment = await PaymentRepository.createPayment({
      provider,
      amount,
      currency,
      idempotencyKey,
    });

    // Dispatch Background Job for Processing
    await paymentQueue.add('process-payment', {
      paymentId: payment.id,
      amount,
      currency,
      provider,
    });

    await cacheIdempotency(idempotencyKey, payment);

    return payment;
  }

  static async processWebhook(paymentId: string, status: 'SUCCESS' | 'FAILED', reason?: string) {
    logger.info({ paymentId, status }, 'Received webhook update');

    // Map webhook payload to internal database enum
    const newStatus = status === 'SUCCESS' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

    // The repository handles the row-level locking and prevents invalid state transitions
    const updatedPayment = await PaymentRepository.updatePaymentStatusSafe(
      paymentId,
      newStatus,
      reason
    );

    return updatedPayment;
  }
  static async getAllPayments() {
    return await PaymentRepository.getAllPayments();
  }
}
