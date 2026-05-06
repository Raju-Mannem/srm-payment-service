import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { createPaymentSchema, webhookSchema } from '../api/validators/payment.validator';
import { z } from 'zod';

export const registry = new OpenAPIRegistry();

registry.register('CreatePaymentRequest', createPaymentSchema.shape.body);
registry.register('WebhookRequest', webhookSchema.shape.body);

registry.registerPath({
  method: 'post',
  path: '/payments',
  summary: 'Create a new payment',
  tags: ['Payments'],
  request: {
    headers: createPaymentSchema.shape.headers,
    body: {
      content: {
        'application/json': {
          schema: createPaymentSchema.shape.body,
        },
      },
    },
  },
  responses: {
    202: {
      description: 'Payment initiated successfully',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'success' }),
            message: z.string().openapi({ example: 'Payment initiated' }),
            data: z.any(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/webhooks/payment',
  summary: 'Handle payment provider webhooks',
  tags: ['Webhooks'],
  request: {
    body: {
      content: {
        'application/json': { schema: webhookSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: 'Webhook received',
      content: { 'application/json': { schema: z.object({ received: z.boolean() }) } },
    },
  },
});

export const getOpenApiDocumentation = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Payment Service API',
      version: '1.0.0',
      description: 'Stripe, Razorpay, and Mock Payment Integration',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local Dev' }],
  });
};
