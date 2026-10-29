import { z } from 'zod';

export const addMemberSchema = z.object({
  displayName: z.string().min(1).max(50),
});

export const updateMemberSchema = z.object({
  displayName: z.string().min(1).max(50),
});
