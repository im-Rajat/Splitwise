import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { authorizeGroupAccess } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { auditLogQuerySchema } from '../validators/auditLogValidators';
import * as auditLogService from '../../services/auditLogService';

export const auditLogRoutes = Router();

auditLogRoutes.use(authMiddleware);

auditLogRoutes.get(
  '/:groupId/audit-log',
  authorizeGroupAccess,
  validate(auditLogQuerySchema, 'query'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = req.query as any;
      const result = await auditLogService.getAuditLog({
        groupId: req.params.groupId,
        limit: query.limit,
        cursor: query.cursor,
        entityType: query.entityType,
        entityId: query.entityId,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
