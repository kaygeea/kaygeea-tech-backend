import { Router } from "express";
import { validateParamsAsDto } from "../utils/middlewares/debug-middlewares/param-validator.middleware.js";
import { DbService } from "../services/database.service.js";
import { LoggerService } from "../services/logger.service.js";
import { ProfileModel } from "../models/profile.model.js";
import { ProjectDetailModel } from "../models/project-detail.model.js";
import { ViewService } from "../services/view.service.js";
import { ViewController } from "../controllers/view.controller.js";
import { ProjectDetailRequestDto } from "../utils/DTOs/project-detail.request.dto.js";

const loggerService = new LoggerService();
const profileModel = new ProfileModel(DbService.dbConn);
const projectDetailModel = new ProjectDetailModel(DbService.dbConn);
const viewService = new ViewService(
  loggerService,
  profileModel,
  projectDetailModel,
);
const viewController = new ViewController(viewService, loggerService);
const viewRouter: Router = Router();

viewRouter.get("/:userName", viewController.viewHomePage);
viewRouter.get(
  "/:projectName/:projectDetailId",
  validateParamsAsDto(ProjectDetailRequestDto),
  viewController.viewProjectDetailsPage,
);

export default viewRouter;
