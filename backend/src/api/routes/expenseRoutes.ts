import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { authorizeGroupAccess } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
} from '../validators/expenseValidators';
import * as expenseService from '../../services/expenseService';

export const expenseRoutes = Router();

expenseRoutes.use(authMiddleware);

expenseRoutes.post(
  '/:groupId/expenses',
  authorizeGroupAccess,
  validate(createExpenseSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.createExpense({
        groupId: req.params.groupId,
        ...req.body,
      });
      res.status(201).json(expense);
    } catch (err) {
      next(err);
    }
  },
);

expenseRoutes.get(
  '/:groupId/expenses',
  authorizeGroupAccess,
  validate(listExpensesQuerySchema, 'query'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await expenseService.listExpenses(
        req.params.groupId,
        req.query as any,
        req.query.category as any,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

expenseRoutes.get(
  '/:groupId/expenses/:expenseId',
  authorizeGroupAccess,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.getExpenseById(
        req.params.expenseId,
        req.params.groupId,
      );
      res.json(expense);
    } catch (err) {
      next(err);
    }
  },
);

expenseRoutes.put(
  '/:groupId/expenses/:expenseId',
  authorizeGroupAccess,
  validate(updateExpenseSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.updateExpense({
        expenseId: req.params.expenseId,
        groupId: req.params.groupId,
        userId: req.userId!,
        ...req.body,
      });
      res.json(expense);
    } catch (err) {
      next(err);
    }
  },
);

expenseRoutes.delete(
  '/:groupId/expenses/:expenseId',
  authorizeGroupAccess,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await expenseService.deleteExpense(req.params.expenseId, req.params.groupId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
