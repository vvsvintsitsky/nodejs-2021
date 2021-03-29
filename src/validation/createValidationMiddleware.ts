import { NextFunction, Request, Response } from "express";

export function createValidationMiddleware(
  validate: (
    data: Record<string, any>
  ) => { message?: string }[] | null | undefined
) {
  return function schemaValidationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const errors = validate(req.body);

    if (!errors) {
      next();
    } else {
      res.status(400).json(errors);
    }
  };
}
