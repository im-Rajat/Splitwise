import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from '../validators/authValidators';
import * as authService from '../../services/authService';

export const authRoutes = Router();

authRoutes.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },
);

authRoutes.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = await authService.login(req.body);
      res.json(tokens);
    } catch (err) {
      next(err);
    }
  },
);

authRoutes.post(
  '/refresh',
  validate(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
