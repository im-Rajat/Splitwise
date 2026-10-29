import { prisma } from '../config/database';
import { SplitMethod, Category } from '@prisma/client';
import { calculateSplit } from './splitEngine';
import { notFound, validationError } from '../utils/errors';
import { checkVersion } from '../utils/versionCheck';
import { createAuditEntry } from './auditLogService';
import { PaginationParams, buildPaginationQuery, paginateResults, PaginatedResult } from '../utils/pagination';

export interface CreateExpenseInput {
  groupId: string;
  description?: string;
  totalAmount: number;
  category: Category;
  categoryNote?: string;
  splitMethod: SplitMethod;
  payerId: string;
  participantIds?: string[];
  shares?: { memberId: string; amount?: number; percentage?: number }[];
}

export async function createExpense(input: CreateExpenseInput) {
  // Validate payer belongs to group
  const payer = await prisma.member.findUnique({ where: { id: input.payerId } });
  if (!payer || payer.groupId !== input.groupId) {
    throw validationError('Payer must be a member of the group');
  }

  // Calculate shares
  const shareResults = calculateSplit(
    input.splitMethod,
    input.totalAmount,
    input.participantIds,
    input.shares,
  );

  // Validate all members belong to group
  const memberIds = shareResults.map((s) => s.memberId);
  const members = await prisma.member.findMany({
    where: { id: { in: memberIds }, groupId: input.groupId },
  });
  if (members.length !== memberIds.length) {
    throw validationError('All participants must be members of the group');
  }

  // Validate payer is a participant
  if (!memberIds.includes(input.payerId)) {
    throw validationError('Payer must be included as a participant');
  }

  // Create expense with shares in transaction
  const expense = await prisma.$transaction(async (tx) => {
    const exp = await tx.expense.create({
      data: {
        groupId: input.groupId,
        description: input.description,
        totalAmount: input.totalAmount,
        category: input.category,
        categoryNote: input.categoryNote,
        splitMethod: input.splitMethod,
        payerId: input.payerId,
      },
    });

    await tx.expenseShare.createMany({
      data: shareResults.map((s) => ({
        expenseId: exp.id,
        memberId: s.memberId,
        amount: s.amount,
      })),
    });

    return tx.expense.findUnique({
      where: { id: exp.id },
      include: {
        shares: { include: { member: { select: { displayName: true } } } },
        payer: { select: { id: true, displayName: true } },
      },
    });
  });

  return expense;
}

export async function listExpenses(groupId: string, pagination: PaginationParams, category?: Category) {
  const paginationQuery = buildPaginationQuery(pagination);
  const items = await prisma.expense.findMany({
    where: {
      groupId,
      deletedAt: null,
      ...(category && { category }),
    },
    ...paginationQuery,
    include: {
      payer: { select: { id: true, displayName: true } },
      _count: { select: { shares: true } },
    },
  });

  const mapped = items.map((e) => ({
    id: e.id,
    description: e.description,
    totalAmount: e.totalAmount,
    category: e.category,
    splitMethod: e.splitMethod,
    payer: e.payer,
    participantCount: e._count.shares,
    createdAt: e.createdAt,
  }));

  return paginateResults(mapped, pagination.limit);
}

export async function getExpenseById(expenseId: string, groupId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      shares: { include: { member: { select: { displayName: true } } } },
      payer: { select: { id: true, displayName: true } },
    },
  });

  if (!expense || expense.groupId !== groupId || expense.deletedAt !== null) {
    throw notFound('EXPENSE_NOT_FOUND', 'Expense not found');
  }

  return expense;
}

export interface UpdateExpenseInput extends CreateExpenseInput {
  expenseId: string;
  version: number;
  userId: string;
}

export async function updateExpense(input: UpdateExpenseInput) {
  const existing = await prisma.expense.findUnique({
    where: { id: input.expenseId },
    include: { shares: true },
  });

  if (!existing || existing.groupId !== input.groupId || existing.deletedAt !== null) {
    throw notFound('EXPENSE_NOT_FOUND', 'Expense not found');
  }

  checkVersion(existing.version, input.version, 'Expense');

  // Recalculate shares
  const shareResults = calculateSplit(
    input.splitMethod,
    input.totalAmount,
    input.participantIds,
    input.shares,
  );

  // Validate members
  const memberIds = shareResults.map((s) => s.memberId);
  const members = await prisma.member.findMany({
    where: { id: { in: memberIds }, groupId: input.groupId },
  });
  if (members.length !== memberIds.length) {
    throw validationError('All participants must be members of the group');
  }
  if (!memberIds.includes(input.payerId)) {
    throw validationError('Payer must be included as a participant');
  }

  const previousState = {
    totalAmount: existing.totalAmount,
    category: existing.category,
    splitMethod: existing.splitMethod,
    payerId: existing.payerId,
    shares: existing.shares.map((s) => ({ memberId: s.memberId, amount: s.amount })),
  };

  const expense = await prisma.$transaction(async (tx) => {
    // Delete old shares
    await tx.expenseShare.deleteMany({ where: { expenseId: input.expenseId } });

    // Update expense
    const updated = await tx.expense.update({
      where: { id: input.expenseId },
      data: {
        description: input.description,
        totalAmount: input.totalAmount,
        category: input.category,
        categoryNote: input.categoryNote,
        splitMethod: input.splitMethod,
        payerId: input.payerId,
        version: { increment: 1 },
      },
    });

    // Create new shares
    await tx.expenseShare.createMany({
      data: shareResults.map((s) => ({
        expenseId: input.expenseId,
        memberId: s.memberId,
        amount: s.amount,
      })),
    });

    return tx.expense.findUnique({
      where: { id: input.expenseId },
      include: {
        shares: { include: { member: { select: { displayName: true } } } },
        payer: { select: { id: true, displayName: true } },
      },
    });
  });

  // Create audit log
  await createAuditEntry({
    entityType: 'EXPENSE',
    entityId: input.expenseId,
    action: 'UPDATED',
    previousState,
    newState: {
      totalAmount: input.totalAmount,
      category: input.category,
      splitMethod: input.splitMethod,
      payerId: input.payerId,
      shares: shareResults,
    },
    userId: input.userId,
  });

  return expense;
}

export async function deleteExpense(expenseId: string, groupId: string, userId: string) {
  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { shares: true },
  });

  if (!existing || existing.groupId !== groupId || existing.deletedAt !== null) {
    throw notFound('EXPENSE_NOT_FOUND', 'Expense not found');
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: { deletedAt: new Date() },
  });

  await createAuditEntry({
    entityType: 'EXPENSE',
    entityId: expenseId,
    action: 'DELETED',
    previousState: {
      totalAmount: existing.totalAmount,
      category: existing.category,
      splitMethod: existing.splitMethod,
      payerId: existing.payerId,
      shares: existing.shares.map((s) => ({ memberId: s.memberId, amount: s.amount })),
    },
    newState: null,
    userId,
  });
}
