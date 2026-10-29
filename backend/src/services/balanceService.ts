import { prisma } from '../config/database';

export interface PairwiseBalance {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface MemberNetBalance {
  id: string;
  displayName: string;
  netBalance: number;
}

/**
 * Compute pairwise balances for all members in a group.
 * Returns only non-zero balances where amount > 0 means "from" owes "to".
 */
export async function getPairwiseBalances(groupId: string): Promise<PairwiseBalance[]> {
  const members = await prisma.member.findMany({ where: { groupId } });
  const memberMap = new Map(members.map((m) => [m.id, m.displayName]));

  // Build a net matrix: net[A][B] > 0 means A owes B
  const net: Record<string, Record<string, number>> = {};
  for (const m of members) {
    net[m.id] = {};
    for (const n of members) {
      net[m.id][n.id] = 0;
    }
  }

  // Process expenses: each participant's share creates a debt to the payer
  const expenses = await prisma.expense.findMany({
    where: { groupId, deletedAt: null },
    include: { shares: true },
  });

  for (const expense of expenses) {
    for (const share of expense.shares) {
      if (share.memberId !== expense.payerId) {
        // share.memberId owes expense.payerId
        net[share.memberId][expense.payerId] += share.amount;
      }
    }
  }

  // Process settlements: payer reduces their debt to payee
  const settlements = await prisma.settlement.findMany({
    where: { groupId, deletedAt: null },
  });

  for (const settlement of settlements) {
    net[settlement.payerId][settlement.payeeId] -= settlement.amount;
  }

  // Consolidate: for each pair (A, B), compute net direction
  const balances: PairwiseBalance[] = [];
  const seen = new Set<string>();

  for (const a of members) {
    for (const b of members) {
      if (a.id === b.id) continue;
      const key = [a.id, b.id].sort().join('-');
      if (seen.has(key)) continue;
      seen.add(key);

      const aOwesB = net[a.id][b.id];
      const bOwesA = net[b.id][a.id];
      const netAmount = aOwesB - bOwesA;

      if (netAmount > 0) {
        balances.push({
          fromId: a.id,
          fromName: memberMap.get(a.id)!,
          toId: b.id,
          toName: memberMap.get(b.id)!,
          amount: netAmount,
        });
      } else if (netAmount < 0) {
        balances.push({
          fromId: b.id,
          fromName: memberMap.get(b.id)!,
          toId: a.id,
          toName: memberMap.get(a.id)!,
          amount: -netAmount,
        });
      }
    }
  }

  return balances;
}

/**
 * Get net balance for each member in a group.
 * Positive = owed money (creditor), Negative = owes money (debtor).
 */
export async function getMemberNetBalances(groupId: string): Promise<MemberNetBalance[]> {
  const members = await prisma.member.findMany({ where: { groupId } });
  const balances = await getPairwiseBalances(groupId);

  const netMap: Record<string, number> = {};
  for (const m of members) {
    netMap[m.id] = 0;
  }

  for (const b of balances) {
    netMap[b.fromId] -= b.amount; // owes
    netMap[b.toId] += b.amount; // owed
  }

  return members.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    netBalance: netMap[m.id],
  }));
}

/**
 * Get the net balance for a single member.
 */
export async function getMemberBalance(groupId: string, memberId: string): Promise<number> {
  const netBalances = await getMemberNetBalances(groupId);
  const member = netBalances.find((m) => m.id === memberId);
  return member?.netBalance ?? 0;
}

/**
 * Get how much fromMember owes toMember (directional).
 */
export async function getDirectionalBalance(groupId: string, fromId: string, toId: string): Promise<number> {
  const balances = await getPairwiseBalances(groupId);
  const found = balances.find((b) => b.fromId === fromId && b.toId === toId);
  return found?.amount ?? 0;
}
