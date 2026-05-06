import { type IPaymentGateway } from './gateway.interface';
import { StripeGateway } from './stripe.gateway';
import { RazorpayGateway } from './razorpay.gateway';
import { MockGateway } from './mock.gateway';

export class GatewayFactory {
  static getGateway(provider: 'stripe' | 'razorpay' | 'mock'): IPaymentGateway {
    switch (provider) {
      case 'stripe':
        return new StripeGateway();
      case 'razorpay':
        return new RazorpayGateway();
      case 'mock':
      default:
        return new MockGateway();
    }
  }
}
