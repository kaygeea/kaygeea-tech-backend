abstract class AppBaseError extends Error {
  abstract httpErrorCode: number;
  abstract errorType: string;
  abstract status: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AppBaseError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppBaseError;
