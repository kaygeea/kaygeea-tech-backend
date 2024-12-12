import { RequestHandler, Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import DtoValidationError from "../customErrors/validation.error.js";
import { BaseDto } from "../DTOs/base.dto.js";
import UnexpectedError from "../customErrors/unexpected.error.js";

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
