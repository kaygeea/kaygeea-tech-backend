import { Logger } from "winston";
import dotenv from "dotenv";
import { LoggerService } from "./logger.service.js";
import status from "http-status";
import {
  CreateLsiRequestDto,
  socialPlatformNames,
} from "../utils/DTOs/create-lsi-request.dto.js";
import { UserProfileService } from "./user-profile.service.js";
import AppBaseError from "../utils/customErrors/base.error.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";
import {
  AddNewLsiRequestDto,
  IAddNewLsiRequestBody,
} from "../utils/DTOs/add-new-lsi-request.dto.js";
import { HttpError } from "../utils/customErrors/httpError.js";

import { UserUtilityServices } from "./user-utility.service.js";
import { LsiMilestoneNotificationDto } from "../utils/DTOs/lsi-milestone-notification.dto.js";
import { UserProfileModel } from "../models/user-profile.model.js";
import { EmailService } from "./email.service.js";

/**
 * Service class for managing Link Source Identifiers (LSIs).
 * This service handles the creation, storage, and updating of LSIs and provides
 * notifications when specific milestones are reached.
 */
export class LsiService {
  private readonly logger: Logger;

  /**
   * Initializes an instance of the LsiService.
   * @param {LoggerService} loggerService - Service for creating loggers.
   * @param {UserProfileService} userProfileService - Service for managing user profiles.
   * @param {UserProfileModel} userProfileModel - Model for interacting with the `profiles` collection in the DB.
   * @param {UserUtilityServices} userUtilityServices - Utility services for user-related operations.
   * @param {EmailService} emailService - Service for sending emails.
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userProfileService: UserProfileService,
    private readonly userProfileModel: UserProfileModel,
    private readonly userUtilityServices: UserUtilityServices,
    private readonly emailService: EmailService,
  ) {
    dotenv.config();
    this.logger = this.loggerService.createLogger(
      "LsiServiceLogger",
      "LsiService",
    );
  }

  /**
   * Creates a new Link Source Identifier (LSI) for a user on a specified social media platform.
   *
   * @param {CreateLsiRequestDto} lsiData - Data required to create the LSI.
   * @returns {Promise<string>} The generated LSI string.
   * @throws {HttpError} If the user does not exist or if an LSI already exists for the platform.
   * @throws {UnexpectedError} For any other unexpected errors.
   */
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

      const lsiExists = await this.lsiRecordExists(
        username,
        socialMediaPlatform,
      );

      if (lsiExists) {
        this.logger.warn("LSI creation for existing LSI attempted.");
        throw new HttpError(
          `An LSI for ${socialMediaPlatform} already exists.`,
          status.CONFLICT,
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
        generationDate: new Date(),
      };
      const DbLsiData = new AddNewLsiRequestDto(DbLsiObject);

      await this.addNewLsi(DbLsiData);

      this.logger.info(
        `${socialMediaPlatform} LSI for user ${username} created and saved successfully`,
      );

      return lsi;
    } catch (error: unknown) {
      if (!(error instanceof AppBaseError)) {
        throw new UnexpectedError(
          `Unexpected error while trying to create LSI for user: ${username}`,
          error as Error,
          "LsiService.createLinkSourceIdentifier",
        );
      }
      throw error;
    }
  }

  /**
   * Checks if an LSI record already exists for a user on a specific social media platform.
   *
   * @private
   * @param {string} username - The username of the user.
   * @param {socialPlatformNames} spn - The social media platform name.
   * @returns {Promise<boolean>} True if the record exists, false otherwise.
   */
  private async lsiRecordExists(username: string, spn: socialPlatformNames) {
    const lsiRecord = await this.userProfileModel.getLsiRecord(username, spn);

    if (!lsiRecord) {
      return false;
    }

    return true;
  }

  /**
   * Adds a new LSI record to the database.
   *
   * @private
   * @param {AddNewLsiRequestDto} DbLsiData - Data transfer object containing LSI record details.
   * @returns {Promise<void>} Resolves when the record is successfully added.
   * @throws {UnexpectedError} For any unexpected errors during the operation.
   */
  private async addNewLsi(DbLsiData: AddNewLsiRequestDto): Promise<void> {
    try {
      const { username, socialPlatformName } = DbLsiData;
      this.logger.info(
        `Adding ${socialPlatformName} LSI record for user: ${username}`,
      );

      await this.userProfileModel.addNewLsiRecord(username, DbLsiData);

      this.logger.info(
        `Successfully added new ${socialPlatformName} LSI record for user: ${username}`,
      );
    } catch (error: unknown) {
      if (!(error instanceof AppBaseError)) {
        throw new UnexpectedError(
          `Unexpected error while trying to add new LSI record`,
          error as Error,
          "LsiService.addNewLsi()",
        );
      }
      throw error;
    }
  }

  /**
   * Updates the visitor count for in an LSI record in the DB
   * and checks if a visitor milestone target has been reached.
   *
   * @param {string} email - The user's email for notification purposes.
   * @param {string} username - The username of the user.
   * @param {string} lsi - The LSI string.
   * @returns {Promise<LsiMilestoneNotificationDto | null>} Notification data if a milestone is reached, otherwise null.
   * @throws {UnexpectedError} For any unexpected errors during the operation.
   */
  async updateLsiCount(
    email: string,
    username: string,
    lsi: string,
  ): Promise<LsiMilestoneNotificationDto | null> {
    try {
      let notificationData: LsiMilestoneNotificationDto | null = null;
      const countUpdatedLsiRecord = await this.userProfileModel.updateLsiCount(
        username,
        lsi,
      );
      if (!countUpdatedLsiRecord) {
        this.logger.info(
          "LSI Count update failed. Invalid LSI hash part received",
        );
      } else {
        this.logger.info(
          `Successfully updated LSI visitor count. Checking if LSI Milestone target for ${countUpdatedLsiRecord.s_p_n} has been reached`,
        );

        const lsiMilestoneTarget = process.env.LSI_MILESTONE_TARGET as string;

        if (countUpdatedLsiRecord.count === parseInt(lsiMilestoneTarget)) {
          notificationData = new LsiMilestoneNotificationDto(
            countUpdatedLsiRecord,
            username,
            email,
            lsiMilestoneTarget,
          );
        } else if (countUpdatedLsiRecord.count < parseInt(lsiMilestoneTarget)) {
          this.logger.info(
            `LSI milestone for ${countUpdatedLsiRecord.s_p_n} not reached yet. Currently at ${countUpdatedLsiRecord.count}`,
          );
        }
      }

      return notificationData;
    } catch (error: unknown) {
      if (!(error instanceof AppBaseError)) {
        // Process will crash if any error is thrown!
        throw new UnexpectedError(
          `Unexpected error while trying to add new LSI record`,
          error as Error,
          "LsiService.updateLsiCount()",
        );
      }
      throw error;
    }
  }

  /**
   * Sends a notification email when an LSI milestone target is reached.
   *
   * @param {LsiMilestoneNotificationDto} notificationData - Data required for sending the notification email.
   * @returns {Promise<void>} Resolves when the email is successfully sent.
   */
  async notifyOnLsiMilestone(notificationData: LsiMilestoneNotificationDto) {
    this.logger.info(
      `Sending LSI milestone target notification email to ${notificationData.userEmail}`,
    );

    await this.emailService.sendLsiMilestoneNotification(notificationData);
  }
}
