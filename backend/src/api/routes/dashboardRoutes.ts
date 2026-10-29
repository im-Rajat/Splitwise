import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { authorizeGroupAccess } from '../middleware/authorize';
import * as dashboardService from '../../services/dashboardService';

export const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);

dashboardRoutes.get(
  '/:groupId/dashboard',
  authorizeGroupAccess,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dashboard = await dashboardService.getDashboard(req.params.groupId);
      res.json(dashboard);
    } catch (err) {
      next(err);
    }
  },
);
