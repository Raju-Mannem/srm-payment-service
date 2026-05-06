import { PaymentStatus, Prisma } from '../generated/prisma/client';
import { prisma } from '../prisma/db';
import { AppError, NotFoundError } from '../types/errors';

export class PaymentRepository {
  static async createPayment(data: {
    provider: string;
    amount: number;
    currency: string;
    idempotencyKey: string;
  }) {
    try {
      return await prisma.payment.create({
        data: {
          amount: data.amount,
          provider: data.provider,
          currency: data.currency,
          idempotencyKey: data.idempotencyKey,
          status: PaymentStatus.PENDING,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Idempotency key already exists in database', 409);
      }
      throw error;
    }
  }
  static async updatePaymentStatusSafe(
    id: string,
    newStatus: PaymentStatus,
    failureReason?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const lockedRows: any[] = await tx.$queryRaw`
        SELECT id, status FROM "paymentsystem"."payments" WHERE id = ${id} FOR UPDATE
      `;

      if (!lockedRows.length) {
        throw new NotFoundError(`Payment ${id} not found`);
      }

      const currentPayment = lockedRows[0];
      if (
        currentPayment.status === PaymentStatus.SUCCESS ||
        currentPayment.status === PaymentStatus.FAILED
      ) {
        return currentPayment;
      }
      return await tx.payment.update({
        where: { id },
        data: {
          status: newStatus,
          ...(failureReason && { failureReason }),
        },
      });
    });
  }
  static async getAllPayments() {
    return await prisma.payment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
