import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { authorizeGroupAccess } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createGroupSchema, updateGroupSchema } from '../validators/groupValidators';
import { paginationSchema } from '../../utils/pagination';
import * as groupService from '../../services/groupService';

export const groupRoutes = Router();

groupRoutes.use(authMiddleware);

groupRoutes.post(
  '/',
  validate(createGroupSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const group = await groupService.createGroup({
        name: req.body.name,
        userId: req.userId!,
      });
      res.status(201).json(group);
    } catch (err) {
      next(err);
    }
  },
);

groupRoutes.get(
  '/',
  validate(paginationSchema, 'query'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await groupService.listGroups(req.userId!, req.query as any);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

groupRoutes.get(
  '/:groupId',
  authorizeGroupAccess,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const group = await groupService.getGroupById(req.params.groupId);
      res.json(group);
    } catch (err) {
      next(err);
    }
  },
);

groupRoutes.patch(
  '/:groupId',
  authorizeGroupAccess,
  validate(updateGroupSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const group = await groupService.updateGroup(req.params.groupId, req.body.name);
      res.json(group);
    } catch (err) {
      next(err);
    }
  },
);
