import { RequestHandler, Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import DtoValidationError from "../customErrors/validation.error.js";
import { BaseDto } from "../DTOs/base.dto.js";
import UnexpectedError from "../customErrors/unexpected.error.js";

/**
 * Middleware to validate the request payload against a specified Data Transfer Object (DTO) class.
 *
 * This function uses `class-transformer` to transform the request body into an instance of the provided DTO
 * and `class-validator` to validate the instance. If validation fails, it forwards a `DtoValidationError`.
 * If an unexpected error occurs during validation, it forwards an `UnexpectedError`.
 *
 * @template T - The type of the DTO class extending `BaseDto`.
 * @param {{ new (...args: any[]): T }} dto - The DTO class used to validate the request payload.
 * @returns {RequestHandler} - An Express middleware function that validates the request payload.
 *
 * @throws {DtoValidationError} If validation fails, an error containing the validation details is forwarded.
 * @throws {UnexpectedError} If an unexpected error occurs during validation.
 */
export function validatePayloadAsDto<T extends BaseDto>(dto: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
}): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const errors: ValidationError[] = await validate(
        plainToInstance(dto, req.body),
        {
          whitelist: true,
          forbidNonWhitelisted: true,
          validationError: { target: false },
        },
      );
      if (errors.length > 0) {
        return next(new DtoValidationError("Invalid data", errors));
      }

      return next();
    } catch (error: unknown) {
      return next(
        new UnexpectedError(
          "Unexpected validation error",
          error as Error,
          "ValidatePayloadAsDto()",
        ),
      );
    }
  };
}
