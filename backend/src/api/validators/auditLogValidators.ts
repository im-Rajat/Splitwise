import { z } from 'zod';

export const auditLogQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entityType: z.enum(['EXPENSE', 'SETTLEMENT']).optional(),
  entityId: z.string().uuid().optional(),
});
