import { z } from 'zod';

export const exportQuerySchema = z.object({
  format: z.enum(['text', 'pdf']),
});
