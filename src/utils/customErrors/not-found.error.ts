import status from "http-status";
import AppBaseError from "./base.error.js";

export default class NotFoundError extends AppBaseError {
  httpErrorCode: number = status.NOT_FOUND;
  errorType: string = "NOT_FOUND_ERROR";
  status: string = "fail";

  constructor(message: string) {
    super(`${message} not found.`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
