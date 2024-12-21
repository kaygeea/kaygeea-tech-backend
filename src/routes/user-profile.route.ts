import { Router } from "express";
import { validatePayloadAsDto } from "../utils/middlewares/body-validator.middleware.js";
import { DbService } from "../services/database.service.js";
import { LoggerService } from "../services/logger.service.js";
import { UserUtilityServices } from "../services/user-utility.service.js";
import { UserProfileModel } from "../models/user-profile.model.js";
import UserProfileController from "../controllers/user-profile.controller.js";
import { UserProfileService } from "../services/user-profile.service.js";
import { RegisterRequestDto } from "../utils/DTOs/register-request.dto.js";
import { LoginRequestDto } from "../utils/DTOs/login.request.dto.js";
import { CreateLsiRequestDto } from "../utils/DTOs/create-lsi-request.dto.js";
import { LsiService } from "../services/lsi.service.js";
import LsiController from "../controllers/lsi.controller.js";

const loggerService = new LoggerService();
const userprofileModel = new UserProfileModel(DbService.dbConn);
const utilityService = new UserUtilityServices();
const userProfileService = new UserProfileService(
  loggerService,
  utilityService,
  userprofileModel,
);
const lsiService = new LsiService(
  loggerService,
  userProfileService,
  utilityService,
);

const lsiController = new LsiController(loggerService, lsiService);

const profileController = new UserProfileController(
  userProfileService,
  loggerService,
);

const userProfileRouter = Router();

userProfileRouter.post(
  "/register",
  validatePayloadAsDto(RegisterRequestDto),
  profileController.register,
);

userProfileRouter.post(
  "/login",
  validatePayloadAsDto(LoginRequestDto),
  profileController.login,
);

userProfileRouter.post(
  "/link/create",
  validatePayloadAsDto(CreateLsiRequestDto),
  lsiController.createLsi,
);

export default userProfileRouter;
