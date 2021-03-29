import { NextFunction, Request, Response } from "express";

export function extractDataFromBody(req: Request) {
  return req.body;
}

export function extractDataFromParams(req: Request) {
  return req.params;
}

export function createValidationMiddleware(
  validate: (
    data: Record<string, any>
  ) => { message?: string; dataPath?: string }[] | null | undefined,
  extractDataToValidate = extractDataFromBody
) {
  return function schemaValidationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const errors = validate(extractDataToValidate(req))?.map(({ message, dataPath }) => ({
      message,
      dataPath,
    }));

    if (!errors) {
      next();
    } else {
      res.status(400).json(errors);
    }
  };
}
