import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { authorizeGroupAccess } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createSettlementSchema, updateSettlementSchema } from '../validators/settlementValidators';
import { paginationSchema } from '../../utils/pagination';
import * as settlementService from '../../services/settlementService';

export const settlementRoutes = Router();

settlementRoutes.use(authMiddleware);

settlementRoutes.post(
  '/:groupId/settlements',
  authorizeGroupAccess,
  validate(createSettlementSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const settlement = await settlementService.createSettlement({
        groupId: req.params.groupId,
        ...req.body,
      });
      res.status(201).json(settlement);
    } catch (err) {
      next(err);
    }
  },
);

settlementRoutes.get(
  '/:groupId/settlements',
  authorizeGroupAccess,
  validate(paginationSchema, 'query'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await settlementService.listSettlements(
        req.params.groupId,
        req.query as any,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

settlementRoutes.get(
  '/:groupId/settlements/:settlementId',
  authorizeGroupAccess,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const settlement = await settlementService.getSettlementById(
        req.params.settlementId,
        req.params.groupId,
      );
      res.json(settlement);
    } catch (err) {
      next(err);
    }
  },
);

settlementRoutes.put(
  '/:groupId/settlements/:settlementId',
  authorizeGroupAccess,
  validate(updateSettlementSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const settlement = await settlementService.updateSettlement({
        settlementId: req.params.settlementId,
        groupId: req.params.groupId,
        userId: req.userId!,
        ...req.body,
      });
      res.json(settlement);
    } catch (err) {
      next(err);
    }
  },
);

settlementRoutes.delete(
  '/:groupId/settlements/:settlementId',
  authorizeGroupAccess,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await settlementService.deleteSettlement(
        req.params.settlementId,
        req.params.groupId,
        req.userId!,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
