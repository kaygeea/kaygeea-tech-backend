import { Collection, Db } from "mongodb";
import { Logger } from "winston";
import { LoggerService } from "../services/logger.service.js";

export class ViewModel {
  private readonly collection: Collection;
  private readonly logger: Logger;

  constructor(
    private readonly dbConn: Db,
    private readonly loggerService: LoggerService,
  ) {
    this.collection = this.dbConn.collection("profiles");
    this.logger = this.loggerService.createLogger(
      "ViewModelLogger",
      "ViewModel",
    );
  }
}
