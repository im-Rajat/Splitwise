import { z } from 'zod';

export const createSettlementSchema = z
  .object({
    payerId: z.string().uuid(),
    payeeId: z.string().uuid(),
    amount: z.number().int().positive(),
  })
  .refine((data) => data.payerId !== data.payeeId, {
    message: 'Payer and payee cannot be the same member',
    path: ['payeeId'],
  });

export const updateSettlementSchema = z
  .object({
    payerId: z.string().uuid(),
    payeeId: z.string().uuid(),
    amount: z.number().int().positive(),
    version: z.number().int().positive(),
  })
  .refine((data) => data.payerId !== data.payeeId, {
    message: 'Payer and payee cannot be the same member',
    path: ['payeeId'],
  });
