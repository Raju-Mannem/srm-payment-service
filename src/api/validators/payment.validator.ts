import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const createPaymentSchema = z
  .object({
    body: z.object({
      provider: z.enum(['stripe', 'razorpay', 'mock']).openapi({ example: 'stripe' }),
      amount: z.number().positive('Amount must be greater than 0').openapi({ example: 1000 }),
      currency: z
        .string()
        .length(3, 'Currency must be a 3-letter ISO code')
        .toUpperCase()
        .openapi({ example: 'USD' }),
    }),
    headers: z
      .object({
        'idempotency-key': z.uuid('Idempotency key must be a valid UUID'),
      })
      .loose()
      .openapi({ example: '9d07af55-0ab7-458d-85b5-97879f423cf0' }),
  })
  .openapi('CreatePaymentRequest');

export const webhookSchema = z.object({
  body: z.object({
    paymentId: z.uuid().openapi({ example: '20382dh230239d23' }),
    status: z.enum(['SUCCESS', 'FAILED']).openapi({ example: 'SUCCESS' }),
    reason: z.string().optional().openapi({ example: 'Network error' }),
  }),
});
