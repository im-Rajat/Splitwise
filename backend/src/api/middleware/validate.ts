import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);

      // Express 5 exposes req.query as a getter that re-parses the URL, so plain
      // assignment throws. Shadow it with an own property so handlers see the
      // parsed values (coerced numbers, defaults).
      Object.defineProperty(req, target, { value: parsed, writable: true, enumerable: true });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        _res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details,
          },
        });
        return;
      }
      next(err);
    }
  };
}
