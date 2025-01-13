import { Request, Response } from "express";
import { Logger } from "winston";
import { UserProfileService } from "../services/user-profile.service.js";
import { asyncErrorHandler } from "../utils/middlewares/async-error-handler.js";
import { RegisterRequestDto } from "../utils/DTOs/register-request.dto.js";
import { LoginRequestDto } from "../utils/DTOs/login.request.dto.js";
import { LoggerService } from "../services/logger.service.js";

/**
 * Controller for handling user profile-related requests, including registration and login.
 * It integrates with the UserProfileService for business logic and utilizes
 * the LoggerService for request profiling.
 */
export default class ProfileController {
  private readonly logger: Logger;

  /**
   * Constructs an instance of ProfileController.
   * @param {UserProfileService} userProfileService - Service for managing user profiles.
   * @param {LoggerService} loggerService - Service for profiling requests.
   */
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.createLogger(
      "ProfileControllerLogger",
      "ProfileController",
    );
  }

  /**
   * Handles user registration requests.
   * Validates and processes user data to create a new user profile.
   *
   * @function
   * @async
   * @param {Request} req - The HTTP request object containing user registration data in the body.
   * @param {Response} res - The HTTP response object used to send the response.
   */
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

  /**
   * Handles user login requests.
   * Validates login credentials and authenticates the user.
   * Responds with a success message and username if login is successful.
   *
   * @function
   * @async
   * @param {Request} req - The HTTP request object containing login credentials in the body.
   * @param {Response} res - The HTTP response object used to send the response.
   */
  login = asyncErrorHandler(async (req: Request, res: Response) => {
    const profiler = this.logger.startTimer();

    const loginData = new LoginRequestDto(req.body);
    const authenticatedUser = await this.userProfileService.login(loginData);

    profiler.done({
      message: `${req.method} Request to ${req.url} processed.`,
    });

    res.status(200).json({
      message: "Login successful",
      username: authenticatedUser,
    });
  });
}
