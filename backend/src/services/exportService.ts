import PDFDocument from 'pdfkit';
import { prisma } from '../config/database';
import { getMemberNetBalances } from './balanceService';
import { Readable } from 'stream';

export async function exportAsText(groupId: string): Promise<string> {
  const [group, members, expenses, settlements, balances] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    prisma.member.findMany({ where: { groupId }, orderBy: { createdAt: 'asc' } }),
    prisma.expense.findMany({
      where: { groupId, deletedAt: null },
      include: { shares: true, payer: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.settlement.findMany({
      where: { groupId, deletedAt: null },
      include: { payer: true, payee: true },
      orderBy: { createdAt: 'asc' },
    }),
    getMemberNetBalances(groupId),
  ]);

  const memberMap = new Map(members.map((m) => [m.id, m.displayName]));
  const formatAmount = (paisa: number) => `₹${(paisa / 100).toFixed(2)}`;
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  let output = '';
  output += `--- ${group?.name ?? 'Group'} - Expense Ledger ---\n`;
  output += `Generated: ${new Date().toISOString().replace('T', ' ').split('.')[0]}\n\n`;
  output += `Members: ${members.map((m) => m.displayName).join(', ')}\n\n`;

  output += `== Expenses ==\n`;
  expenses.forEach((expense, idx) => {
    output += `${idx + 1}. ${formatDate(expense.createdAt)} | ${expense.description ?? 'No description'} | ${formatAmount(expense.totalAmount)} | Paid by: ${expense.payer.displayName} | Split: ${expense.splitMethod}\n`;
    const shareDetails = expense.shares
      .map((s) => `   ${memberMap.get(s.memberId)}: ${formatAmount(s.amount)}`)
      .join('\n');
    output += shareDetails + '\n\n';
  });

  output += `== Settlements ==\n`;
  settlements.forEach((s, idx) => {
    output += `${idx + 1}. ${formatDate(s.createdAt)} | ${s.payer.displayName} → ${s.payee.displayName} | ${formatAmount(s.amount)}\n`;
  });
  output += '\n';

  output += `== Current Balances ==\n`;
  balances.forEach((b) => {
    const sign = b.netBalance >= 0 ? '+' : '';
    const label = b.netBalance >= 0 ? '(owed)' : '(owes)';
    output += `${b.displayName}: ${sign}${formatAmount(Math.abs(b.netBalance))} ${label}\n`;
  });

  return output;
}

export async function exportAsPdf(groupId: string): Promise<Buffer> {
  const [group, members, expenses, settlements, balances] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    prisma.member.findMany({ where: { groupId }, orderBy: { createdAt: 'asc' } }),
    prisma.expense.findMany({
      where: { groupId, deletedAt: null },
      include: { shares: true, payer: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.settlement.findMany({
      where: { groupId, deletedAt: null },
      include: { payer: true, payee: true },
      orderBy: { createdAt: 'asc' },
    }),
    getMemberNetBalances(groupId),
  ]);

  const memberMap = new Map(members.map((m) => [m.id, m.displayName]));
  const formatAmount = (paisa: number) => `Rs.${(paisa / 100).toFixed(2)}`;
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(18).text(`${group?.name ?? 'Group'} - Expense Ledger`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toISOString().split('T')[0]}`);
    doc.text(`Members: ${members.map((m) => m.displayName).join(', ')}`);
    doc.moveDown();

    // Expenses
    doc.fontSize(14).text('Expenses');
    doc.moveDown(0.5);
    doc.fontSize(9);
    expenses.forEach((expense, idx) => {
      doc.text(
        `${idx + 1}. ${formatDate(expense.createdAt)} | ${expense.description ?? '-'} | ${formatAmount(expense.totalAmount)} | Paid by: ${expense.payer.displayName} | ${expense.splitMethod}`,
      );
      expense.shares.forEach((s) => {
        doc.text(`     ${memberMap.get(s.memberId)}: ${formatAmount(s.amount)}`);
      });
      doc.moveDown(0.3);
    });

    doc.moveDown();

    // Settlements
    doc.fontSize(14).text('Settlements');
    doc.moveDown(0.5);
    doc.fontSize(9);
    settlements.forEach((s, idx) => {
      doc.text(
        `${idx + 1}. ${formatDate(s.createdAt)} | ${s.payer.displayName} -> ${s.payee.displayName} | ${formatAmount(s.amount)}`,
      );
    });

    doc.moveDown();

    // Balances
    doc.fontSize(14).text('Current Balances');
    doc.moveDown(0.5);
    doc.fontSize(9);
    balances.forEach((b) => {
      const label = b.netBalance >= 0 ? '(owed)' : '(owes)';
      doc.text(`${b.displayName}: ${formatAmount(Math.abs(b.netBalance))} ${label}`);
    });

    doc.end();
  });
}
