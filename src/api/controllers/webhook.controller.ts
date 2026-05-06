import type { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../../services/payment/payment.service';
import { logger } from '../../config/logger';

export class WebhookController {
  static async handlePaymentUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId, status, reason } = req.body;
      await PaymentService.processWebhook(paymentId, status, reason);
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error({ err: error, paymentId: req.body?.paymentId }, 'Webhook processing failed');
      next(error);
    }
  }
}
