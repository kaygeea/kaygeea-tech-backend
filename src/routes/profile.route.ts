import { Router } from "express";
import { validatePayloadAsDto } from "../utils/middlewares/body-validator.middleware.js";
import { DbService } from "../services/database.service.js";
import { LoggerService } from "../services/logger.service.js";
import { UserUtilityServices } from "../services/user-utility.service.js";
import { ProfileModel } from "../models/profile.model.js";
import ProfileController from "../controllers/profile.controller.js";
import { ProfileService } from "../services/profile.service.js";
import { RegisterRequestDto } from "../utils/DTOs/register-request.dto.js";
import { LoginRequestDto } from "../utils/DTOs/login.request.dto.js";

const loggerService: LoggerService = new LoggerService();
const profileModel: ProfileModel = new ProfileModel(DbService.dbConn);
const utilityService: UserUtilityServices = new UserUtilityServices();
const profileService: ProfileService = new ProfileService(
  loggerService,
  utilityService,
  profileModel,
);
const profileController: ProfileController = new ProfileController(
  profileService,
  loggerService,
);

const profileRouter: Router = Router();

profileRouter.post(
  "/register",
  validatePayloadAsDto(RegisterRequestDto),
  profileController.register,
);

profileRouter.post(
  "/login",
  validatePayloadAsDto(LoginRequestDto),
  profileController.login,
);

export default profileRouter;
