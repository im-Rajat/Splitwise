import { prisma } from '../config/database';
import { notFound, validationError } from '../utils/errors';
import { checkVersion } from '../utils/versionCheck';
import { createAuditEntry } from './auditLogService';
import { getDirectionalBalance } from './balanceService';
import { PaginationParams, buildPaginationQuery, paginateResults } from '../utils/pagination';

export interface CreateSettlementInput {
  groupId: string;
  payerId: string;
  payeeId: string;
  amount: number;
}

export async function createSettlement(input: CreateSettlementInput) {
  // Validate both members belong to group
  const [payer, payee] = await Promise.all([
    prisma.member.findUnique({ where: { id: input.payerId } }),
    prisma.member.findUnique({ where: { id: input.payeeId } }),
  ]);

  if (!payer || payer.groupId !== input.groupId) {
    throw validationError('Payer must be a member of the group');
  }
  if (!payee || payee.groupId !== input.groupId) {
    throw validationError('Payee must be a member of the group');
  }

  // Auto-cap at outstanding debt
  const outstandingDebt = await getDirectionalBalance(input.groupId, input.payerId, input.payeeId);
  let finalAmount = input.amount;
  let amountCapped = false;

  if (outstandingDebt > 0 && input.amount > outstandingDebt) {
    finalAmount = outstandingDebt;
    amountCapped = true;
  }

  const settlement = await prisma.settlement.create({
    data: {
      groupId: input.groupId,
      payerId: input.payerId,
      payeeId: input.payeeId,
      amount: finalAmount,
    },
    include: {
      payer: { select: { id: true, displayName: true } },
      payee: { select: { id: true, displayName: true } },
    },
  });

  return {
    ...settlement,
    amountCapped,
    ...(amountCapped && { originalAmount: input.amount, outstandingDebt }),
  };
}

export async function listSettlements(groupId: string, pagination: PaginationParams) {
  const paginationQuery = buildPaginationQuery(pagination);
  const items = await prisma.settlement.findMany({
    where: { groupId, deletedAt: null },
    ...paginationQuery,
    include: {
      payer: { select: { id: true, displayName: true } },
      payee: { select: { id: true, displayName: true } },
    },
  });

  return paginateResults(items, pagination.limit);
}

export async function getSettlementById(settlementId: string, groupId: string) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      payer: { select: { id: true, displayName: true } },
      payee: { select: { id: true, displayName: true } },
    },
  });

  if (!settlement || settlement.groupId !== groupId || settlement.deletedAt !== null) {
    throw notFound('SETTLEMENT_NOT_FOUND', 'Settlement not found');
  }

  return settlement;
}

export interface UpdateSettlementInput {
  settlementId: string;
  groupId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  version: number;
  userId: string;
}

export async function updateSettlement(input: UpdateSettlementInput) {
  const existing = await prisma.settlement.findUnique({
    where: { id: input.settlementId },
  });

  if (!existing || existing.groupId !== input.groupId || existing.deletedAt !== null) {
    throw notFound('SETTLEMENT_NOT_FOUND', 'Settlement not found');
  }

  checkVersion(existing.version, input.version, 'Settlement');

  // Validate members
  const [payer, payee] = await Promise.all([
    prisma.member.findUnique({ where: { id: input.payerId } }),
    prisma.member.findUnique({ where: { id: input.payeeId } }),
  ]);
  if (!payer || payer.groupId !== input.groupId) {
    throw validationError('Payer must be a member of the group');
  }
  if (!payee || payee.groupId !== input.groupId) {
    throw validationError('Payee must be a member of the group');
  }

  // Auto-cap at outstanding debt (excluding current settlement)
  const outstandingDebt = await getDirectionalBalance(input.groupId, input.payerId, input.payeeId);
  // Add back the current settlement amount since it will be replaced
  const adjustedDebt = outstandingDebt + existing.amount;
  let finalAmount = input.amount;
  let amountCapped = false;

  if (adjustedDebt > 0 && input.amount > adjustedDebt) {
    finalAmount = adjustedDebt;
    amountCapped = true;
  }

  const previousState = {
    payerId: existing.payerId,
    payeeId: existing.payeeId,
    amount: existing.amount,
  };

  const settlement = await prisma.settlement.update({
    where: { id: input.settlementId },
    data: {
      payerId: input.payerId,
      payeeId: input.payeeId,
      amount: finalAmount,
      version: { increment: 1 },
    },
    include: {
      payer: { select: { id: true, displayName: true } },
      payee: { select: { id: true, displayName: true } },
    },
  });

  await createAuditEntry({
    entityType: 'SETTLEMENT',
    entityId: input.settlementId,
    action: 'UPDATED',
    previousState,
    newState: { payerId: input.payerId, payeeId: input.payeeId, amount: finalAmount },
    userId: input.userId,
  });

  return { ...settlement, amountCapped };
}

export async function deleteSettlement(settlementId: string, groupId: string, userId: string) {
  const existing = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });

  if (!existing || existing.groupId !== groupId || existing.deletedAt !== null) {
    throw notFound('SETTLEMENT_NOT_FOUND', 'Settlement not found');
  }

  await prisma.settlement.update({
    where: { id: settlementId },
    data: { deletedAt: new Date() },
  });

  await createAuditEntry({
    entityType: 'SETTLEMENT',
    entityId: settlementId,
    action: 'DELETED',
    previousState: {
      payerId: existing.payerId,
      payeeId: existing.payeeId,
      amount: existing.amount,
    },
    newState: null,
    userId,
  });
}
