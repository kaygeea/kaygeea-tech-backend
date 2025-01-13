import dotenv from "dotenv";
import { Logger } from "winston";
import { LoggerService } from "./logger.service.js";
import { UserProfileModel } from "../models/user-profile.model.js";
import { ProjectDetailModel } from "../models/project-detail.model.js";
import { IUserProfile } from "../interfaces/user-profile.interface.js";
import { IProjectDetail } from "../interfaces/project-detail.interface.js";
import { ProjectDetailRequestDto } from "../utils/DTOs/project-detail.request.dto.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";
import AppBaseError from "../utils/customErrors/base.error.js";
import NotFoundError from "../utils/customErrors/not-found.error.js";
import { GeneralUtilityServices } from "./general-utility.service.js";
import { UserProfileEvents } from "../events/user-profile.event.js";

/**
 * Service for handling view-related operations, such as
 * fetching user profiles and project details for the frontend.
 */
export class ViewService {
  private readonly logger: Logger;

  /**
   * Initializes the `ViewService`.
   * @param {LoggerService} loggerService - The logger service for managing logging.
   * @param {UserProfileModel} userProfileModel - Model for interacting with the `profiles` collection in the DB.
   * @param {ProjectDetailModel} projectDetailModel - Model for interacting with `project details` collection in the DB.
   * @param {GeneralUtilityServices} generalUtilityService - Utility service for general operations.
   * @param {UserProfileEvents} userProfileEvents - Event emitter for user profile-related events.
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userProfileModel: UserProfileModel,
    private readonly projectDetailModel: ProjectDetailModel,
    private readonly generalUtilityService: GeneralUtilityServices,
    private readonly userProfileEvents: UserProfileEvents,
  ) {
    dotenv.config();
    this.logger = this.loggerService.createLogger(
      "ViewServiceLogger",
      "ViewService",
      process.env.USER_SERVICE_LOG_FILE,
    );
  }

  /**
   * Fetches the home page profile of a user for the frontend, based on an input LSI (Link Source Identifier).
   * @param {string} lsi - The Link Source Identifier used to identify the user.
   * @returns {Promise<IUserProfile>} The user's profile data.
   * @throws {NotFoundError} If the user profile is not found.
   * @throws {UnexpectedError} If an unexpected error occurs.
   */
  async getHomePageProfile(lsi: string): Promise<IUserProfile> {
    const username = this.generalUtilityService.getUsernameFromLsi(lsi);

    try {
      this.logger.info(`Fetching home page profile for user: ${username}`);
      const profile: IUserProfile | null =
        await this.userProfileModel.fetchUserProfileBy("username", username);

      if (!profile) {
        throw new NotFoundError(`User with username: ${username}`);
      }
      this.logger.info(
        `Successfully retrieved profile with ID: ${profile._id}.`,
      );

      if (this.generalUtilityService.getHashPartFromLsi(lsi)) {
        this.logger.info(
          `Updating LSI visitor count for user with ID: ${profile?._id}.`,
        );
        this.userProfileEvents.emitEvent(
          "full lsi used",
          profile.email,
          username,
          lsi,
        );
      }

      return profile;
    } catch (error: unknown) {
      if (!(error instanceof AppBaseError)) {
        throw new UnexpectedError(
          `Unexpected error while trying to fetch home page profile for user: ${username}`,
          error as Error,
          "ViewService.getHomePageProfile",
        );
      }
      throw error;
    }
  }

  /**
   * Fetches project details by project name.
   * @param {ProjectDetailRequestDto} projectDetailRequestData - The data transfer object containing the project name.
   * @returns {Promise<IProjectDetail | null>} The project detail or null if not found.
   * @throws {NotFoundError} If the project detail is not found.
   * @throws {UnexpectedError} If an unexpected error occurs.
   */
  async getProjectDetailBy(
    projectDetailRequestData: ProjectDetailRequestDto,
  ): Promise<IProjectDetail | null> {
    const { projectName } = projectDetailRequestData;

    try {
      this.logger.info(
        `Fetching project details for project "${projectName}".`,
      );

      const projectDetail: IProjectDetail | null =
        await this.projectDetailModel.fetchProjectDetailBy(
          projectDetailRequestData,
        );

      if (!projectDetail) {
        throw new NotFoundError(`Project detail for project: ${projectName}`);
      }

      this.logger.info(
        `Successfully fetched project details for project: ${projectName}`,
      );
      return projectDetail;
    } catch (error: unknown) {
      if (!(error instanceof AppBaseError)) {
        throw new UnexpectedError(
          `Unexpected error while trying to fetch project detail for project: ${projectName}`,
          error as Error,
          "ViewService.getProjectDetailById()",
        );
      }
      throw error;
    }
  }
}
