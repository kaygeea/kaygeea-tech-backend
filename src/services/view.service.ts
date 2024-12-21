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
import { UserProfileEvents } from "../events/user-profile.events.js";

export class ViewService {
  private readonly logger: Logger;

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

  async getHomePageProfile(lsi: string): Promise<IUserProfile> {
    // Used to fetch the profile data on the root route
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
        this.userProfileEvents.emitEvent("full lsi used", username, lsi);
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
