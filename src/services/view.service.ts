import dotenv from "dotenv";
import { Logger } from "winston";
import { LoggerService } from "./logger.service.js";
import { ProfileModel } from "../models/profile.model.js";
import { ProjectDetailModel } from "../models/project-detail.model.js";
import { IUserProfile } from "../interfaces/user-profile.interface.js";
import { IProjectDetail } from "../interfaces/project-detail.interface.js";
import { ProjectDetailRequestDto } from "../utils/DTOs/project-detail.request.dto.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";
import AppBaseError from "../utils/customErrors/base.error.js";
import NotFoundError from "../utils/customErrors/not-found.error.js";

export class ViewService {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly profileModel: ProfileModel,
    private readonly projectDetailModel: ProjectDetailModel,
  ) {
    dotenv.config();
    this.logger = this.loggerService.createLogger(
      "ViewServiceLogger",
      "ViewService",
      process.env.USER_SERVICE_LOG_FILE,
    );
  }

  async getHomePageProfile(username: string): Promise<IUserProfile> {
    // Used to fetch the profile data on the root route
    try {
      this.logger.info(`Fetching home page profile for user: ${username}`);
      const profile: IUserProfile | null =
        await this.profileModel.fetchUserProfileBy("username", username);

      if (!profile) {
        throw new NotFoundError(`User with username: ${username}`);
        // Log?
      }
      this.logger.info(
        `Profile for user ${username}, with id ${profile?._id} retrieved successfully`,
      );

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
