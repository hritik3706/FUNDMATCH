import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: fieldErrors(result.error),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

function fieldErrors(error: ZodError): Record<string, string> {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() || "body";
    if (!details[key]) {
      details[key] = issue.message;
    }
  }
  return details;
}
