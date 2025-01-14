import { Logger } from "winston";
import { NextFunction, Response, Request } from "express";
import { LoggerService } from "./logger.service.js";
import { UserUtilityServices } from "./user-utility.service.js";
import { IUserProfile } from "../interfaces/user-profile.interface.js";
import { HttpError } from "../utils/customErrors/httpError.js";
import { UserProfileModel } from "../models/user-profile.model.js";
import dotenv from "dotenv";

/**
 * Service for handling user authentication.
 */
export class AuthenticationService {
  private readonly logger: Logger;
  private readonly jwtSecret: string | undefined;

  /**
   * Initializes the `AuthenticationService`.
   * @param {LoggerService} loggerService - The logger service for managing logs.
   * @param {UserProfileModel} userProfileModel - Model for interacting with the `profiles` collection.
   * @param {UserUtilityServices} userUtilityService - Utility service for handling user-related tasks.
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userProfileModel: UserProfileModel,
    private readonly userUtilityService: UserUtilityServices,
  ) {
    dotenv.config();
    this.jwtSecret = process.env.JWT_SECRET;
    this.logger = this.loggerService.createLogger(
      "Authentication service logger",
      "AuthenticationService",
    );
  }

  /**
   * Middleware for authenticating incoming requests.
   * Extracts and verifies the JWT token, fetches the associated user, and passes control to the next middleware.
   * @param {Request} req - The incoming HTTP request.
   * @param {Response} _res - The outgoing HTTP response (unused).
   * @param {NextFunction} next - The next middleware function.
   * @throws {HttpError} Throws a 401 Unauthorized error if authentication fails.
   */
  authenticateRequest = async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const jwtToken = this.extractToken(req);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = await this.verifyAndFetchUser(jwtToken);
      next();
    } catch (error: unknown) {
      this.logger.error(`Authentication failed: ${(error as Error).message}`);
      next(
        new HttpError(
          "Authentication failed. Please provide valid credentials.",
          401,
        ),
      );
    }
  };

  /**
   * Extracts the JWT token from the Authorization header of the request.
   * @private
   * @param {Request} req - The incoming HTTP request.
   * @returns {string} The extracted JWT token.
   * @throws {HttpError} Throws a 401 Unauthorized error if the Authorization header is missing or invalid.
   */
  private extractToken(req: Request): string {
    const authorization = req.headers.authorization;

    if (!authorization) {
      this.logger.warn("Missing Authorization header.");
      throw new HttpError("Unauthorized", 401);
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
      this.logger.warn("Invalid Authorization header format.");
      throw new HttpError("Unauthorized", 401);
    }

    return token;
  }

  /**
   * Verifies the JWT token and fetches the associated user profile.
   * @private
   * @param {string} token - The JWT token to verify.
   * @returns {Promise<IUserProfile>} The user profile associated with the token.
   * @throws {HttpError} Throws a 401 Unauthorized error if token verification fails or the user is not found.
   */
  private async verifyAndFetchUser(token: string): Promise<IUserProfile> {
    try {
      const payload = this.userUtilityService.jwtVerifyToken(
        token,
        this.jwtSecret,
      ) as {
        email: string;
      };

      const user = await this.userProfileModel.fetchUserProfileBy(
        "email",
        payload.email,
      );
      if (!user) {
        this.logger.warn(`User not found for email: ${payload.email}`);
        throw new HttpError("Invalid token. User not found.", 401);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Token verification failed: ${(error as Error).message}`,
      );
      throw new HttpError("Invalid or expired token.", 401);
    }
  }
}
