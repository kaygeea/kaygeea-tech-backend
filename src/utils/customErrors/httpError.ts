import AppBaseError from "./base.error.js";

export class HttpError extends AppBaseError {
  httpErrorCode: number;
  errorType: string = "HTTP_EXCEPTION_ERROR";
  status: string = "fail";

  constructor(message: string, statusCode: number) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
    this.httpErrorCode = statusCode;
  }
}
