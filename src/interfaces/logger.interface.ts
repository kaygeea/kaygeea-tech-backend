import { Logger } from "winston";

export interface ILogger {
  createLogger(
    loggerName: string,
    loggerScope: string,
    logFilePath: string,
  ): Logger;
}
