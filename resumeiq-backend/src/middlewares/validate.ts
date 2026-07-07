import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'fail',
          message: 'Validation failed processing input fields.',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.').replace('body.', ''),
            message: issue.message,
          })),
        });
        return;
      }
      return next(error);
    }
  };
};