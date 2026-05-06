import { type IPaymentGateway } from './gateway.interface';
import { StripeGateway } from './stripe.gateway';
import { RazorpayGateway } from './razorpay.gateway';
import { MockGateway } from './mock.gateway';

export class GatewayFactory {
  static getGateway(provider: 'STRIPE' | 'RAZORPAY' | 'MOCK'): IPaymentGateway {
    switch (provider) {
      case 'STRIPE':
        return new StripeGateway();
      case 'RAZORPAY':
        return new RazorpayGateway();
      case 'MOCK':
      default:
        return new MockGateway();
    }
  }
}
