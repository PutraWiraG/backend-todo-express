import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};