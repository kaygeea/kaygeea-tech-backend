import { Logger } from "winston";
import { LoggerService } from "./logger.service.js";

/**
 * Service providing general utility functions for operations like parsing and extracting parts of an LSI (Link Source Identifier).
 */
export class GeneralUtilityServices {
  private readonly logger?: Logger;

  /**
   * Constructs an instance of `GeneralUtilityServices` with an optional logger service.
   * @param {LoggerService} [loggerService] - Optional logger service for logging operations.
   */
  constructor(private readonly loggerService?: LoggerService) {
    if (loggerService) {
      this.logger = loggerService.createLogger(
        "GeneralUtilityServicesLogger",
        "GeneralUtilityServices",
      );
    }
  }

  /**
   * Extracts the username from a given LSI.
   * @param {string} lsi - The LSI string in the format `<username>-<hash>_<nanoid>`.
   * @returns {string} The extracted username.
   */
  getUsernameFromLsi(lsi: string): string {
    return lsi.split("-", 1)[0];
  }

  /**
   * Extracts the hash part (i.e. `<hash>_<nanoid>`) from a given LSI.
   * @param {string} lsi - The LSI string in the format `<username>-<hash>_<nanoid>`.
   * @returns {string | undefined} The extracted hash part in the format `<hash>_<nanoid>`, or `undefined` if not present.
   */
  getHashPartFromLsi(lsi: string): string | undefined {
    return lsi.split("-")[1];
  }

  /**
   * Extracts the hash from the hash part of the LSI.
   * @private
   * @param {string} lsi - The LSI string in the format `<username>-<hash>_<nanoid>`.
   * @returns {string} The extracted hash.
   */
  private getHashFromLsi(lsi: string): string {
    return lsi.split("-")[1].split("_")[0];
  }

  /**
   * Extracts the nanoid from the hash part of the LSI.
   * @private
   * @param {string} lsi - The LSI string in the format `<username>-<hash>_<nanoid>`.
   * @returns {string} The extracted nanoid.
   */
  private getNanoidFromLsi(lsi: string): string {
    return lsi.split("_")[1];
  }
}
