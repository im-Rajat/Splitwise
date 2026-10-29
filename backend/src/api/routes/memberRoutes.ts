import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { authorizeGroupAccess } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { addMemberSchema, updateMemberSchema } from '../validators/memberValidators';
import * as memberService from '../../services/memberService';

export const memberRoutes = Router();

memberRoutes.use(authMiddleware);

memberRoutes.post(
  '/:groupId/members',
  authorizeGroupAccess,
  validate(addMemberSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const member = await memberService.addMember(req.params.groupId, req.body.displayName);
      res.status(201).json(member);
    } catch (err) {
      next(err);
    }
  },
);

memberRoutes.patch(
  '/:groupId/members/:memberId',
  authorizeGroupAccess,
  validate(updateMemberSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const member = await memberService.updateMember(
        req.params.memberId,
        req.body.displayName,
        req.params.groupId,
      );
      res.json(member);
    } catch (err) {
      next(err);
    }
  },
);

memberRoutes.delete(
  '/:groupId/members/:memberId',
  authorizeGroupAccess,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await memberService.deleteMember(req.params.memberId, req.params.groupId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
