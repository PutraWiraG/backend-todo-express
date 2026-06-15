import { Response } from "express";

interface ResponseOptions {
  statusCode?: number;
  message?: string;
  data?: unknown;
  meta?: unknown;
}

export const successResponse = (
  res: Response,
  {
    statusCode = 200,
    message = "Success",
    data = null,
    meta,
  }: ResponseOptions
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: meta ?? undefined,
  });
};

export const errorResponse = (
  res: Response,
  {
    statusCode = 500,
    message = "Internal Server Error",
    data = null,
  }: ResponseOptions
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};