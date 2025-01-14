import { Router } from "express";
import { validateParamsAsDto } from "../utils/middlewares/param-validator.middleware.js";
import { DbService } from "../services/database.service.js";
import { LoggerService } from "../services/logger.service.js";
import { UserProfileModel } from "../models/user-profile.model.js";
import { ProjectDetailModel } from "../models/project-detail.model.js";
import { ViewService } from "../services/view.service.js";
import { ViewController } from "../controllers/view.controller.js";
import { ProjectDetailRequestDto } from "../utils/DTOs/project-detail.request.dto.js";
import { UserProfileService } from "../services/user-profile.service.js";
import { UserUtilityServices } from "../services/user-utility.service.js";
import { GeneralUtilityServices } from "../services/general-utility.service.js";
import { UserProfileEvents } from "../events/user-profile.event.js";
import { LsiService } from "../services/lsi.service.js";
import { EmailService } from "../services/email.service.js";
// import logRequestBody from "../utils/middlewares/debugging-middlewares/log-req-value.middleware.js";

const loggerService = new LoggerService();
const userProfileModel = new UserProfileModel(DbService.dbConn);
const projectDetailModel = new ProjectDetailModel(DbService.dbConn);
const userUtilityService = new UserUtilityServices();
const emailService = new EmailService(loggerService);
const userProfileService = new UserProfileService(
  loggerService,
  userUtilityService,
  userProfileModel,
);
const lsiService = new LsiService(
  loggerService,
  userProfileService,
  userProfileModel,
  userUtilityService,
  emailService,
);

const userProfileEvents = new UserProfileEvents(lsiService);

const viewService = new ViewService(
  loggerService,
  userProfileModel,
  projectDetailModel,
  new GeneralUtilityServices(),
  userProfileEvents,
);

const viewController = new ViewController(viewService, loggerService);

const viewRouter = Router();

viewRouter.get("/:lsi", viewController.viewHomePage);
viewRouter.get(
  "/projects/:projectName/:projectDetailId?",
  validateParamsAsDto(ProjectDetailRequestDto),
  viewController.viewProjectDetailsPage,
);

export default viewRouter;
