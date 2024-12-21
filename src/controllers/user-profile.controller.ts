import { Request, Response } from "express";
import { Logger } from "winston";
import { UserProfileService } from "../services/user-profile.service.js";
import { asyncErrorHandler } from "../utils/middlewares/async-error-handler.js";
import { RegisterRequestDto } from "../utils/DTOs/register-request.dto.js";
import { LoginRequestDto } from "../utils/DTOs/login.request.dto.js";
import { LoggerService } from "../services/logger.service.js";

export default class ProfileController {
  private readonly logger: Logger;
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.createLogger(
      "ProfileControllerLogger",
      "ProfileController",
    );
  }

  register = asyncErrorHandler(async (req: Request, res: Response) => {
    const profiler = this.logger.startTimer();

    const userData = new RegisterRequestDto(req.body);
    const newUser = await this.userProfileService.register(userData);

    profiler.done({
      message: `${req.method} Request to ${req.url} processed.`,
    });

    res.status(201).json({
      message: "User successfully registered",
      data: newUser,
    });
  });

  login = asyncErrorHandler(async (req: Request, res: Response) => {
    const profiler = this.logger.startTimer();

    const loginData = new LoginRequestDto(req.body);
    const authenticatedUser = await this.userProfileService.login(loginData);

    profiler.done({
      message: `${req.method} Request to ${req.url} processed.`,
    });

    res.status(200).json({
      message: "Login successful",
      username: authenticatedUser.username,
    });
  });
}
