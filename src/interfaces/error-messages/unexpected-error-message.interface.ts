export interface IUnexpectedErrorMessage {
  message: string;
  origin: string;
  originalErrMsg: string;
  stackTrace: string | undefined;
}
