export interface GatewayResponse {
  status: 'SUCCESS' | 'FAILED';
  transactionId?: string;
  reason?: string;
}

export interface IPaymentGateway {
  processPayment(amount: number, currency: string): Promise<GatewayResponse>;
}
