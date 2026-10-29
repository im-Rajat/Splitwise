export interface SimplifiedTransaction {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface MemberBalance {
  id: string;
  displayName: string;
  netBalance: number;
}

/**
 * Greedy debt simplification algorithm (min-cash-flow).
 * Computes the minimum number of transactions to settle all debts.
 * 
 * Algorithm:
 * 1. Compute net balance for each member
 * 2. Separate into creditors (positive) and debtors (negative)
 * 3. Match largest debtor with largest creditor, transfer min of both, repeat
 */
export function simplifyDebts(memberBalances: MemberBalance[]): SimplifiedTransaction[] {
  // Separate into creditors and debtors
  const creditors: { id: string; name: string; amount: number }[] = [];
  const debtors: { id: string; name: string; amount: number }[] = [];

  for (const member of memberBalances) {
    if (member.netBalance > 0) {
      creditors.push({ id: member.id, name: member.displayName, amount: member.netBalance });
    } else if (member.netBalance < 0) {
      debtors.push({ id: member.id, name: member.displayName, amount: -member.netBalance });
    }
  }

  const transactions: SimplifiedTransaction[] = [];

  // Sort both by amount descending for greedy matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const transferAmount = Math.min(debtors[i].amount, creditors[j].amount);

    if (transferAmount > 0) {
      transactions.push({
        fromId: debtors[i].id,
        fromName: debtors[i].name,
        toId: creditors[j].id,
        toName: creditors[j].name,
        amount: transferAmount,
      });
    }

    debtors[i].amount -= transferAmount;
    creditors[j].amount -= transferAmount;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return transactions;
}
