import { Logger } from "winston";
import { LoggerService } from "./logger.service.js";

export class GeneralUtilityServices {
  private readonly logger?: Logger;

  constructor(private readonly loggerService?: LoggerService) {
    if (loggerService) {
      this.logger = loggerService.createLogger(
        "GeneralUtilityServicesLogger",
        "GeneralUtilityServices",
      );
    }
  }

  getUsernameFromLsi(lsi: string): string {
    // <username>-<hash>_<nanoid>
    return lsi.split("-", 1)[0];

    // should return <username>
  }

  getHashPartFromLsi(lsi: string): string | undefined {
    // <username>-<hash>_<nanoid>
    return lsi.split("-")[1];

    // should return <hash>_<nanoid>
  }

  private getHashFromLsi(lsi: string): string {
    // <username>-<hash>_<nanoid>
    return lsi.split("-")[1].split("_")[0];

    // should return <hash>
  }

  private getNanoidFromLsi(lsi: string): string {
    // <username>-<hash>_<nanoid>
    return lsi.split("_")[1];

    // should return <nanoid>
  }
}
