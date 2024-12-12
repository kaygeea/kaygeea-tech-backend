import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";
import DtoValidationError from "../../customErrors/validation.error.js";
import UnexpectedError from "../../customErrors/unexpected.error.js";
import { BaseDto } from "../../DTOs/base.dto.js";

export function validateParamsAsDto<T extends BaseDto>(dto: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
}): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const errors: ValidationError[] = await validate(
        plainToInstance(dto, req.params),
        {
          whitelist: true,
          forbidNonWhitelisted: true,
          validationError: { target: false },
        },
      );

      if (errors.length > 0) {
        return next(new DtoValidationError("Invalid URL parameters", errors));
      }

      return next();
    } catch (error: unknown) {
      return next(
        new UnexpectedError(
          "Unexpected error while validating route parameters",
          error as Error,
          "validateParamsAsDto",
        ),
      );
    }
  };
}
