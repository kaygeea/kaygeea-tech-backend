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

export class ViewController {
  private readonly logger: Logger;

  constructor(
    private readonly viewService: ViewService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.createLogger(
      "ViewControllerLogger",
      "ViewController",
    );
  }

  viewHomePage = asyncErrorHandler(async (req: Request, res: Response) => {
    const profiler = this.logger.startTimer();
    const username = req.params.userName || "Kaygeea";
    const homePageProfile: IUserProfile =
      await this.viewService.getHomePageProfile(username);

    profiler.done({
      message: `${req.method} Request to ${req.originalUrl} processed.`,
    });
    res.status(200).json({
      status: "success",
      data: homePageProfile,
    });
  });

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
