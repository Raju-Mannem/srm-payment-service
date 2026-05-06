import type { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../../services/payment/payment.service';
import { logger } from '../../config/logger';

export class PaymentController {
  static async createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider, amount, currency } = req.body;
      const idempotencyKey = req.headers['idempotency-key'] as string;

      logger.info({ idempotencyKey, amount, currency }, 'Received payment creation request');

      const result = await PaymentService.initiatePayment(
        provider,
        amount,
        currency,
        idempotencyKey
      );

      res.status(202).json({
        status: 'success',
        message: 'Payment initiated and is processing',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await PaymentService.getAllPayments();

      res.status(200).json({
        status: 'success',
        count: payments.length,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }
}
