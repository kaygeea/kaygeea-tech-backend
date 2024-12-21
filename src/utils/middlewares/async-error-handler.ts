/**
 * @module AsyncErrorHandler
 * A utility module for handling errors in asynchronous Express route handlers and middleware functions.
 * This simplifies error propagation to the global error-handling middleware.
 */
import { Response, Request, NextFunction, RequestHandler } from "express";
import AppBaseError from "../customErrors/base.error.js";

/**
 * Represents an asynchronous Express middleware or route handler.
 *
 * @param {Request} req - The Express `Request` object.
 * @param {Response} res - The Express `Response` object.
 * @param {NextFunction} next - The Express `NextFunction` callback for error handling.
 * @returns {Promise<void>} A promise that resolves when the handler completes successfully, or rejects with an error.
 */
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps an asynchronous route handler or middleware function and automatically catches
 * any errors, forwarding them to the global error handler middleware.
 *
 * @param {AsyncRequestHandler} asyncFunction - An asynchronous function to handle the request.
 * @returns {Function} A middleware function that handles errors and forwards them to the global error handler middleware.
 *
 */
export function asyncErrorHandler(
  asyncFunction: AsyncRequestHandler,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    asyncFunction(req, res, next).catch((error: AppBaseError) => next(error));
  };
}
