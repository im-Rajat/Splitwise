import { prisma } from '../config/database';
import { getMemberNetBalances } from './balanceService';

export async function getDashboard(groupId: string) {
  const [group, members, expenses, settlements, memberBalances] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    prisma.member.findMany({ where: { groupId } }),
    prisma.expense.findMany({ where: { groupId, deletedAt: null }, include: { shares: true } }),
    prisma.settlement.findMany({ where: { groupId, deletedAt: null } }),
    getMemberNetBalances(groupId),
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalSettlements = settlements.reduce((sum, s) => sum + s.amount, 0);

  // Per-member summaries
  const memberSummaries = members.map((member) => {
    const totalPaid = expenses
      .filter((e) => e.payerId === member.id)
      .reduce((sum, e) => sum + e.totalAmount, 0);

    const totalShare = expenses.reduce((sum, e) => {
      const share = e.shares.find((s) => s.memberId === member.id);
      return sum + (share?.amount ?? 0);
    }, 0);

    const netBalance = memberBalances.find((b) => b.id === member.id)?.netBalance ?? 0;

    return {
      id: member.id,
      displayName: member.displayName,
      totalPaid,
      totalShare,
      netBalance,
    };
  });

  // Category breakdown
  const categoryMap: Record<string, { total: number; count: number }> = {};
  for (const expense of expenses) {
    if (!categoryMap[expense.category]) {
      categoryMap[expense.category] = { total: 0, count: 0 };
    }
    categoryMap[expense.category].total += expense.totalAmount;
    categoryMap[expense.category].count += 1;
  }

  const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
  }));

  return {
    groupId,
    groupName: group?.name,
    totalExpenses,
    totalSettlements,
    expenseCount: expenses.length,
    settlementCount: settlements.length,
    memberSummaries,
    categoryBreakdown,
  };
}
