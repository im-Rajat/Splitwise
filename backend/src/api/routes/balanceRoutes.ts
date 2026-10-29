import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { authorizeGroupAccess } from '../middleware/authorize';
import * as balanceService from '../../services/balanceService';
import { simplifyDebts } from '../../services/debtSimplifier';

export const balanceRoutes = Router();

balanceRoutes.use(authMiddleware);

balanceRoutes.get(
  '/:groupId/balances',
  authorizeGroupAccess,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.params.groupId;
      const [pairwise, memberSummaries] = await Promise.all([
        balanceService.getPairwiseBalances(groupId),
        balanceService.getMemberNetBalances(groupId),
      ]);

      res.json({
        groupId,
        balances: pairwise.map((b) => ({
          from: { id: b.fromId, displayName: b.fromName },
          to: { id: b.toId, displayName: b.toName },
          amount: b.amount,
        })),
        memberSummaries,
      });
    } catch (err) {
      next(err);
    }
  },
);

balanceRoutes.get(
  '/:groupId/balances/simplified',
  authorizeGroupAccess,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.params.groupId;
      const [pairwiseBalances, memberBalances] = await Promise.all([
        balanceService.getPairwiseBalances(groupId),
        balanceService.getMemberNetBalances(groupId),
      ]);

      const simplified = simplifyDebts(memberBalances);

      res.json({
        groupId,
        simplifiedTransactions: simplified.map((t) => ({
          from: { id: t.fromId, displayName: t.fromName },
          to: { id: t.toId, displayName: t.toName },
          amount: t.amount,
        })),
        originalTransactionCount: pairwiseBalances.length,
        simplifiedTransactionCount: simplified.length,
        reductionPercentage:
          pairwiseBalances.length > 0
            ? Math.round(((pairwiseBalances.length - simplified.length) / pairwiseBalances.length) * 100)
            : 0,
      });
    } catch (err) {
      next(err);
    }
  },
);
