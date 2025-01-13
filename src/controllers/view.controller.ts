import { Request, Response } from "express";
import { ViewService } from "../services/view.service.js";
import { asyncErrorHandler } from "../utils/middlewares/async-error-handler.js";
import { IUserProfile } from "../interfaces/user-profile.interface.js";
import { IProjectDetail } from "../interfaces/project-detail.interface.js";
import {
  IProjectDetailRequestBody,
  ProjectDetailRequestDto,
} from "../utils/DTOs/project-detail.request.dto.js";
import { LoggerService } from "../services/logger.service.js";
import { Logger } from "winston";

/**
 * Controller class for handling requests related to retrieving and processing
 * data for the frontend view.
 */
export class ViewController {
  private readonly logger: Logger;

  /**
   * Initializes the ViewController.
   *
   * @param {ViewService} viewService - Service for retrieving user profile and project details.
   * @param {LoggerService} loggerService - Service used for profiling requests.
   */
  constructor(
    private readonly viewService: ViewService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.createLogger(
      "ViewControllerLogger",
      "ViewController",
    );
  }

  /**
   * Handles requests to view the home page.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} - Responds with the user's profile data for the home page.
   * @throws {Error} - Propagates any errors encountered while processing the request.
   */
  viewHomePage = asyncErrorHandler(async (req: Request, res: Response) => {
    const profiler = this.logger.startTimer();

    const homePageProfile: IUserProfile =
      await this.viewService.getHomePageProfile(req.params.lsi);

    profiler.done({
      message: `${req.method} Request to ${req.originalUrl} processed.`,
    });

    res.status(200).json({
      status: "success",
      data: homePageProfile,
    });
  });

  /**
   * Handles requests to view a project's details page.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} - Responds with the project's details data or null if not found.
   * @throws {Error} - Propagates any errors encountered while processing the request.
   */
  viewProjectDetailsPage = asyncErrorHandler(
    async (req: Request, res: Response) => {
      const profiler = this.logger.startTimer();

      const DtoData: IProjectDetailRequestBody = {
        projectName: req.params.projectName,
        projectDetailId: req.params.projectDetailId
          ? req.params.projectDetailId
          : undefined,
      };
      const ProjectDetailRequestData = new ProjectDetailRequestDto(DtoData);
      const projectDetailsPageData: IProjectDetail | null =
        await this.viewService.getProjectDetailBy(ProjectDetailRequestData);

      profiler.done({
        message: `${req.method} Request to ${req.url} processed.`,
      });

      res.status(200).json({
        status: "success",
        data: projectDetailsPageData,
      });
    },
  );
}
