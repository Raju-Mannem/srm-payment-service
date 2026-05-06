import type { IPaymentGateway, GatewayResponse } from './gateway.interface';
import Razorpay from 'razorpay';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export class RazorpayGateway implements IPaymentGateway {
  async processPayment(amount: number, currency: string): Promise<GatewayResponse> {
    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        receipt: `receipt_${Date.now()}`,
      });

      return { status: 'SUCCESS', transactionId: order.id };
    } catch (error: any) {
      logger.error({ err: error }, 'Razorpay payment failed');
      return { status: 'FAILED', reason: error.error?.description || 'Unknown Razorpay error' };
    }
  }
}
