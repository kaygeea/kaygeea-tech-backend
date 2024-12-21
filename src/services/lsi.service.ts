import { Logger } from "winston";
import { LoggerService } from "./logger.service.js";
import status from "http-status";
import { CreateLsiRequestDto } from "../utils/DTOs/create-lsi-request.dto.js";
import { UserProfileService } from "./user-profile.service.js";
import AppBaseError from "../utils/customErrors/base.error.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";
import {
  AddNewLsiRequestDto,
  IAddNewLsiRequestBody,
} from "../utils/DTOs/add-new-lsi-request.dto.js";
import { HttpError } from "../utils/customErrors/httpError.js";

import { UserUtilityServices } from "./user-utility.service.js";

export class LsiService {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly userProfileService: UserProfileService,
    private readonly userUtilityServices: UserUtilityServices,
  ) {
    this.logger = this.loggerService.createLogger(
      "LsiServiceLogger",
      "LsiService",
    );
  }

  async createLinkSourceIdentifier(
    lsiData: CreateLsiRequestDto,
  ): Promise<string> {
    const { username, socialMediaPlatform } = lsiData;

    try {
      this.logger.info(
        `Attempting to create ${socialMediaPlatform} LSI for user: ${username}`,
      );

      const userExists = await this.userProfileService.userProfileExists(
        "username",
        username,
      );

      if (!userExists) {
        this.logger.warn(`LSI creation for non-existing user attempted`);
        throw new HttpError(
          `Only registered users can perform this action.`,
          status.UNAUTHORIZED,
        );
      }

      const lsi = this.userUtilityServices.createLsi(
        username,
        socialMediaPlatform,
      );

      this.logger.info(
        `${socialMediaPlatform} LSI for user: ${username} created Successfully`,
      );

      const DbLsiObject: IAddNewLsiRequestBody = {
        username,
        lsi,
        socialPlatformName: socialMediaPlatform,
      };
      const DbLsiData = new AddNewLsiRequestDto(DbLsiObject);

      // Fire event with data instead
      await this.userProfileService.addNewLsi(DbLsiData);

      this.logger.info(
        `${socialMediaPlatform} LSI for user ${username} created and saved successfully`,
      );

      return lsi;
    } catch (error: unknown) {
      if (!(error instanceof AppBaseError)) {
        throw new UnexpectedError(
          `Unexpected error while trying to create LSI for user: ${username}`,
          error as Error,
          "ViewService.createLinkSourceIdentifier",
        );
      }
      throw error;
    }
  }

  // updateLinkSourceCount(link: string, username: string) {}
}
