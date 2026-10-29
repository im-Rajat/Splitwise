import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../../config/database';
import { notFound, forbidden } from '../../utils/errors';

export async function authorizeGroupAccess(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const groupId = req.params.groupId;
    const userId = req.userId!;

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw notFound('GROUP_NOT_FOUND', 'Group not found');
    }
    if (group.userId !== userId) {
      throw forbidden('You do not have access to this group');
    }

    next();
  } catch (err) {
    next(err);
  }
}
