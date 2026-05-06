import { logger } from '../../config/logger';
import type { IPaymentGateway, GatewayResponse } from './gateway.interface';

export class MockGateway implements IPaymentGateway {
  /**
   * Simulates an external payment gateway.
   * 60% Success, 20% Decline, 10% Network Error, 10% Timeout
   */
  async processPayment(amount: number, currency: string): Promise<GatewayResponse> {
    const random = Math.random();

    // Simulate latency (200–800ms)
    const latency = Math.floor(Math.random() * 600) + 200;
    await new Promise((resolve) => setTimeout(resolve, latency));

    try {
      if (random < 0.6) {
        logger.info({ amount, currency }, 'MockGateway: Payment success');

        return {
          status: 'SUCCESS',
          transactionId: `mock_txn_${Date.now()}`,
        };
      }

      if (random < 0.8) {
        logger.warn({ amount, currency }, 'MockGateway: Payment declined');

        return {
          status: 'FAILED',
          reason: 'Insufficient funds or card declined',
        };
      }

      if (random < 0.9) {
        throw new Error('NETWORK_ERROR: Connection dropped');
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
      throw new Error('TIMEOUT: Gateway did not respond');
    } catch (error: any) {
      logger.error({ err: error }, 'MockGateway: Payment failed');
      return {
        status: 'FAILED',
        reason: error.message || 'Unknown mock error',
      };
    }
  }
}
