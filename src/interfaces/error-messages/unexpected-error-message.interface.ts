export interface IUnexpectedErrorMessage {
  origin: string;
  originalErrMsg: string;
  stackTrace: string | undefined;
}
