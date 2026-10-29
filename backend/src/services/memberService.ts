import { prisma } from '../config/database';
import { conflict, notFound } from '../utils/errors';
import { getMemberBalance } from './balanceService';

export async function addMember(groupId: string, displayName: string) {
  const existing = await prisma.member.findUnique({
    where: { groupId_displayName: { groupId, displayName } },
  });
  if (existing) {
    throw conflict('DUPLICATE_MEMBER_NAME', 'A member with this name already exists in the group');
  }

  return prisma.member.create({
    data: { displayName, groupId },
  });
}

export async function updateMember(memberId: string, displayName: string, groupId: string) {
  const existing = await prisma.member.findUnique({
    where: { groupId_displayName: { groupId, displayName } },
  });
  if (existing && existing.id !== memberId) {
    throw conflict('DUPLICATE_MEMBER_NAME', 'A member with this name already exists in the group');
  }

  return prisma.member.update({
    where: { id: memberId },
    data: { displayName },
  });
}

export async function deleteMember(memberId: string, groupId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member || member.groupId !== groupId) {
    throw notFound('MEMBER_NOT_FOUND', 'Member not found');
  }

  const balance = await getMemberBalance(groupId, memberId);
  if (balance !== 0) {
    const balanceDisplay = (Math.abs(balance) / 100).toFixed(2);
    throw conflict(
      'MEMBER_HAS_BALANCE',
      `Cannot delete member with non-zero balance. Current balance: ₹${balanceDisplay}`,
    );
  }

  await prisma.member.delete({ where: { id: memberId } });
}
