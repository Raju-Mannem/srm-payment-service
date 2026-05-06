import type { IPaymentGateway, GatewayResponse } from './gateway.interface';
import Stripe from 'stripe';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });

export class StripeGateway implements IPaymentGateway {
  async processPayment(amount: number, currency: string): Promise<GatewayResponse> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        confirm: true,
        payment_method: 'pm_card_visa',
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      });

      return { status: 'SUCCESS', transactionId: paymentIntent.id };
    } catch (error: any) {
      logger.error({ err: error }, 'Stripe payment failed');
      return { status: 'FAILED', reason: error.message };
    }
  }
}
