import status from "http-status";
import AppBaseError from "./base.error.js";
import { SerializedError } from "../../interfaces/types/error-serialization.types.js";
import { IUnexpectedErrorMessage } from "../../interfaces/error-messages/unexpected-error-message.interface.js";

export default class UnexpectedError extends AppBaseError {
  httpErrorCode: number = status.INTERNAL_SERVER_ERROR;
  errorType: string = "UNEXPECTED_ERROR";
  status: string = "error";
  errorOrigin: string;
  cause: Error;
  errorMessage: SerializedError;

  constructor(message: string, error: Error, origin: string) {
    super(message);
    Object.setPrototypeOf(this, UnexpectedError.prototype);
    this.cause = error;
    this.errorOrigin = origin || new.target.name;
    this.errorMessage = this.serializeErrors();
  }

  private serializeErrors(): SerializedError {
    const UnexpectedError: IUnexpectedErrorMessage = {
      message: this.message,
      origin: this.errorOrigin,
      originalErrMsg: this.cause.message,
      stackTrace: this.cause.stack,
    };

    return UnexpectedError;
  }
}
