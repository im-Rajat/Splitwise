import { SplitMethod } from '@prisma/client';
import { validationError } from '../utils/errors';

export interface ShareResult {
  memberId: string;
  amount: number;
}

export interface EqualSplitInput {
  totalAmount: number;
  participantIds: string[];
}

export interface ExactSplitInput {
  totalAmount: number;
  shares: { memberId: string; amount: number }[];
}

export interface PercentageSplitInput {
  totalAmount: number;
  shares: { memberId: string; percentage: number }[];
}

/**
 * Equal split: divide total among participants.
 * Remainder paisa(s) assigned to first participant(s) in list order.
 */
export function calculateEqualSplit(input: EqualSplitInput): ShareResult[] {
  const { totalAmount, participantIds } = input;
  const n = participantIds.length;

  if (n === 0) {
    throw validationError('At least one participant is required');
  }

  const base = Math.floor(totalAmount / n);
  const remainder = totalAmount - base * n;

  return participantIds.map((memberId, index) => ({
    memberId,
    amount: index < remainder ? base + 1 : base,
  }));
}

/**
 * Exact split: validate amounts sum to total.
 */
export function calculateExactSplit(input: ExactSplitInput): ShareResult[] {
  const { totalAmount, shares } = input;

  if (shares.length === 0) {
    throw validationError('At least one share is required');
  }

  const sum = shares.reduce((acc, s) => acc + s.amount, 0);
  if (sum !== totalAmount) {
    throw validationError('Exact amounts must sum to total amount', {
      totalAmount,
      sharesSum: sum,
    });
  }

  return shares.map((s) => ({ memberId: s.memberId, amount: s.amount }));
}

/**
 * Percentage split: convert percentages to amounts.
 * Remainder from rounding goes to first participant(s).
 */
export function calculatePercentageSplit(input: PercentageSplitInput): ShareResult[] {
  const { totalAmount, shares } = input;

  if (shares.length === 0) {
    throw validationError('At least one share is required');
  }

  const totalPercentage = shares.reduce((acc, s) => acc + s.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.001) {
    throw validationError('Percentages must sum to 100', {
      totalPercentage,
    });
  }

  // Calculate raw amounts
  const rawAmounts = shares.map((s) => ({
    memberId: s.memberId,
    raw: (totalAmount * s.percentage) / 100,
  }));

  // Floor all amounts
  const floored = rawAmounts.map((r) => ({
    memberId: r.memberId,
    amount: Math.floor(r.raw),
    remainder: r.raw - Math.floor(r.raw),
  }));

  // Distribute remainder to entries with largest fractional parts
  const distributed = floored.reduce((acc, f) => acc + f.amount, 0);
  let remainderToDistribute = totalAmount - distributed;

  // Sort by remainder descending to distribute fairly
  const sorted = [...floored].sort((a, b) => b.remainder - a.remainder);
  for (const entry of sorted) {
    if (remainderToDistribute <= 0) break;
    entry.amount += 1;
    remainderToDistribute -= 1;
  }

  return floored.map((f) => ({ memberId: f.memberId, amount: f.amount }));
}

/**
 * Calculate shares based on split method.
 */
export function calculateSplit(
  method: SplitMethod,
  totalAmount: number,
  participantIds?: string[],
  shares?: { memberId: string; amount?: number; percentage?: number }[],
): ShareResult[] {
  switch (method) {
    case 'EQUAL':
      if (!participantIds || participantIds.length === 0) {
        throw validationError('participantIds required for EQUAL split');
      }
      return calculateEqualSplit({ totalAmount, participantIds });

    case 'EXACT':
      if (!shares || shares.length === 0) {
        throw validationError('shares with amounts required for EXACT split');
      }
      return calculateExactSplit({
        totalAmount,
        shares: shares.map((s) => ({ memberId: s.memberId, amount: s.amount! })),
      });

    case 'PERCENTAGE':
      if (!shares || shares.length === 0) {
        throw validationError('shares with percentages required for PERCENTAGE split');
      }
      return calculatePercentageSplit({
        totalAmount,
        shares: shares.map((s) => ({ memberId: s.memberId, percentage: s.percentage! })),
      });
  }
}
