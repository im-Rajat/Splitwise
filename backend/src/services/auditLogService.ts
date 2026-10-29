import { prisma } from '../config/database';
import { AuditAction, AuditEntityType, Prisma } from '@prisma/client';
import { PaginationParams, buildPaginationQuery, paginateResults, PaginatedResult } from '../utils/pagination';

export interface CreateAuditLogParams {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  userId: string;
}

export interface AuditLogEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  previousState: unknown;
  newState: unknown;
  userId: string;
  createdAt: Date;
}

export async function createAuditEntry(params: CreateAuditLogParams): Promise<AuditLogEntry> {
  return prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      previousState: (params.previousState ?? undefined) as Prisma.InputJsonValue | undefined,
      newState: (params.newState ?? undefined) as Prisma.InputJsonValue | undefined,
      userId: params.userId,
    },
  });
}

export interface GetAuditLogParams extends PaginationParams {
  groupId: string;
  entityType?: AuditEntityType;
  entityId?: string;
}

export async function getAuditLog(params: GetAuditLogParams): Promise<PaginatedResult<AuditLogEntry>> {
  // Get entity IDs belonging to this group
  const [expenseIds, settlementIds] = await Promise.all([
    prisma.expense.findMany({
      where: { groupId: params.groupId },
      select: { id: true },
    }),
    prisma.settlement.findMany({
      where: { groupId: params.groupId },
      select: { id: true },
    }),
  ]);

  const entityIds = [
    ...expenseIds.map((e) => e.id),
    ...settlementIds.map((s) => s.id),
  ];

  const where = {
    entityId: { in: entityIds },
    ...(params.entityType && { entityType: params.entityType }),
    ...(params.entityId && { entityId: params.entityId }),
  };

  const paginationQuery = buildPaginationQuery(params);
  const items = await prisma.auditLog.findMany({
    where,
    ...paginationQuery,
  });

  return paginateResults(items, params.limit);
}
