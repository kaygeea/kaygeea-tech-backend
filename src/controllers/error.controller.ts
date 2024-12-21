import { NextFunction, Request, Response } from "express";
import DtoValidationError from "../utils/customErrors/validation.error.js";
import { LoggerService } from "../services/logger.service.js";
import AppBaseError from "../utils/customErrors/base.error.js";
import UserNotFoundError from "../utils/customErrors/not-found.error.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";
import { HttpError } from "../utils/customErrors/httpError.js";
import { SerializedError } from "../interfaces/types/error-serialization.types.js";

export function globalErrorHandler(
  error: AppBaseError,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const logger = new LoggerService().createLogger(
    "ErrorLogger",
    "globalErrorHandler()",
  );
  const statusCode = error.httpErrorCode || 500;
  const status = error.status || "error";
  const message = error.message || "Something went wrong...";

  if (error instanceof DtoValidationError) {
    logger.error(
      `Invalid data received: ${JSON.stringify(error.errors, null, 2)}`,
    );
    const validationErrors: SerializedError[] = error.errors;

    res.status(statusCode).json({
      status,
      message,
      validationErrors,
    });
  }

  if (error instanceof UserNotFoundError) {
    logger.warn(`${error.message}`);

    res.status(statusCode).json({ status, message });
  }

  if (error instanceof HttpError) {
    logger.error(`${error.message}`);

    res.status(statusCode).json({ status, message });
  }

  if (error instanceof UnexpectedError) {
    logger.error(
      `${error.message}. Details ${JSON.stringify(error.errorMessage, null, 2)}`,
    );

    res.status(statusCode).json({
      status,
      message: "Internal Server Error. Please try again later.",
    });
  }
  return next();
}
