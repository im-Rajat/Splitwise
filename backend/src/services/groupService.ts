import { prisma } from '../config/database';
import { PaginationParams, buildPaginationQuery, paginateResults, PaginatedResult } from '../utils/pagination';

export interface CreateGroupInput {
  name: string;
  userId: string;
}

export async function createGroup(input: CreateGroupInput) {
  return prisma.group.create({
    data: { name: input.name, userId: input.userId },
    include: { members: true },
  });
}

export async function listGroups(userId: string, pagination: PaginationParams): Promise<PaginatedResult<{ id: string; name: string; memberCount: number; createdAt: Date }>> {
  const paginationQuery = buildPaginationQuery(pagination);
  const groups = await prisma.group.findMany({
    where: { userId },
    ...paginationQuery,
    include: { _count: { select: { members: true } } },
  });

  const mapped = groups.map((g) => ({
    id: g.id,
    name: g.name,
    memberCount: g._count.members,
    createdAt: g.createdAt,
  }));

  return paginateResults(mapped, pagination.limit);
}

export async function getGroupById(groupId: string) {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { orderBy: { createdAt: 'asc' } } },
  });
}

export async function updateGroup(groupId: string, name: string) {
  return prisma.group.update({
    where: { id: groupId },
    data: { name },
    include: { members: { orderBy: { createdAt: 'asc' } } },
  });
}
