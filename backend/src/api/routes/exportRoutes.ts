import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { authorizeGroupAccess } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { exportQuerySchema } from '../validators/exportValidators';
import * as exportService from '../../services/exportService';

export const exportRoutes = Router();

exportRoutes.use(authMiddleware);

exportRoutes.get(
  '/:groupId/export',
  authorizeGroupAccess,
  validate(exportQuerySchema, 'query'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const format = (req.query as any).format;

      if (format === 'text') {
        const text = await exportService.exportAsText(req.params.groupId);
        res.setHeader('Content-Type', 'text/plain');
        res.send(text);
      } else {
        const pdf = await exportService.exportAsPdf(req.params.groupId);
        const groupName = req.params.groupId; // Could fetch group name for filename
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ledger.pdf"`);
        res.send(pdf);
      }
    } catch (err) {
      next(err);
    }
  },
);
