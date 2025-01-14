import { Logger, loggers, format, transports } from "winston";
import {
  ConsoleTransportInstance,
  FileTransportInstance,
} from "winston/lib/winston/transports/index.js";
import { ILogger } from "../interfaces/logger.interface.js";
const { combine, errors, json, prettyPrint, timestamp } = format;

/**
 * Handles the creation and management of Winston loggers for different
 * application services and models.
 */
export class LoggerService implements ILogger {
  /**
   * Creates and registers a logger for a given service or model.
   * The logger uses JSON, timestamps, and pretty-print formatting and outputs
   * logs to the console or a file.
   *
   * @param {string} loggerName - Unique name for the logger (e.g., "MyServiceLogger", "MyModelLogger").
   * @param {string} loggerScope - Unique name for the service or model using the logger (e.g., "MyService", "MyModel").
   * @param {string} [logFilePath] - File path for logging to a service/model specific log file (optional).
   *
   * @note If a log file is not needed, logs will always be transported to the console.
   *
   * @returns {Logger} The created Winston logger.
   */
  createLogger(
    loggerName: string,
    loggerScope: string,
    logFilePath?: string,
  ): Logger {
    const transportsList: Array<
      ConsoleTransportInstance | FileTransportInstance
    > = [new transports.Console()];
    if (logFilePath) {
      transportsList.push(new transports.File({ filename: logFilePath }));
    }

    loggers.add(loggerName, {
      format: combine(
        timestamp(),
        json(),
        prettyPrint(),
        errors({ stack: true }),
      ),
      transports: transportsList,
      defaultMeta: { logSource: loggerScope },
    });

    return loggers.get(loggerName);
  }
}
