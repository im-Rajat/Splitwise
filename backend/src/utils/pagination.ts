import { z } from 'zod';

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
}

export function buildPaginationQuery(params: PaginationParams) {
  return {
    take: params.limit + 1,
    ...(params.cursor && {
      skip: 1,
      cursor: { id: params.cursor },
    }),
    orderBy: { createdAt: 'desc' as const },
  };
}

export function paginateResults<T extends { id: string }>(
  items: T[],
  limit: number,
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  return { data, nextCursor };
}
