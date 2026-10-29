import { z } from 'zod';

const categoryEnum = z.enum(['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ENTERTAINMENT', 'UTILITIES', 'OTHER']);
const splitMethodEnum = z.enum(['EQUAL', 'EXACT', 'PERCENTAGE']);

const exactShareSchema = z.object({
  memberId: z.string().uuid(),
  amount: z.number().int().positive(),
});

const percentageShareSchema = z.object({
  memberId: z.string().uuid(),
  percentage: z.number().positive().max(100),
});

export const createExpenseSchema = z
  .object({
    description: z.string().max(200).optional(),
    totalAmount: z.number().int().positive(),
    category: categoryEnum,
    categoryNote: z.string().max(100).optional(),
    splitMethod: splitMethodEnum,
    payerId: z.string().uuid(),
    participantIds: z.array(z.string().uuid()).optional(),
    shares: z.array(z.union([exactShareSchema, percentageShareSchema])).optional(),
  })
  .refine(
    (data) => {
      if (data.category === 'OTHER' && !data.categoryNote) {
        return false;
      }
      return true;
    },
    { message: 'categoryNote is required when category is OTHER', path: ['categoryNote'] },
  )
  .refine(
    (data) => {
      if (data.splitMethod === 'EQUAL' && (!data.participantIds || data.participantIds.length === 0)) {
        return false;
      }
      return true;
    },
    { message: 'participantIds required for EQUAL split', path: ['participantIds'] },
  )
  .refine(
    (data) => {
      if ((data.splitMethod === 'EXACT' || data.splitMethod === 'PERCENTAGE') && (!data.shares || data.shares.length === 0)) {
        return false;
      }
      return true;
    },
    { message: 'shares required for EXACT/PERCENTAGE split', path: ['shares'] },
  );

export const updateExpenseSchema = createExpenseSchema.extend({
  version: z.number().int().positive(),
});
