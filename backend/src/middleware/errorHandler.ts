import { ErrorRequestHandler } from "express";
import { HttpError } from "./httpError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: Record<string, unknown> = {
      success: false,
      error: err.error,
    };
    if (err.details) {
      body.details = err.details;
    }
    if (err.publicMessage) {
      body.message = err.publicMessage;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { body: "Invalid JSON" },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: "An unexpected error occurred",
  });
};
