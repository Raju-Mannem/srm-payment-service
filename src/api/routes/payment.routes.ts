import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { WebhookController } from '../controllers/webhook.controller';
import { createPaymentSchema, webhookSchema } from '../validators/payment.validator';
import { validate } from '../../middlewares/validate.middleware';
import { apiLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();
router.post(
  '/payments',
  apiLimiter,
  validate(createPaymentSchema),
  PaymentController.createPayment
);
router.post('/webhooks/payments', validate(webhookSchema), WebhookController.handlePaymentUpdate);
router.get('/payments', PaymentController.getPayments);
export default router;
