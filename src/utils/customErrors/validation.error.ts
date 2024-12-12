import status from "http-status";
import { SerializedError } from "../../interfaces/types/error-serialization.types.js";
import AppBaseError from "./base.error.js";
import { ValidationError } from "class-validator";

class DtoValidationError extends AppBaseError {
  httpErrorCode: number = status.BAD_REQUEST;
  errorType: string = "VALIDATION_ERROR";
  status: string = "fail";
  errors: SerializedError[];

  constructor(
    message: string,
    private readonly validationErrors: ValidationError[],
  ) {
    super(message);
    Object.setPrototypeOf(this, DtoValidationError.prototype);
    this.errors = this.serializeErrors();
  }

  private serializeErrors(): SerializedError[] {
    return this.validationErrors.map((error) => {
      const { property, constraints, value } = error;

      const message = constraints
        ? Object.values(constraints)[0]
        : "Invalid value";

      return { message, property, value };
    });
  }
}

export default DtoValidationError;
