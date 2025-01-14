import dotenv from "dotenv";
import { InsertOneResult } from "mongodb";
import { Logger } from "winston";
import { LoggerService } from "./logger.service.js";
import { UserUtilityServices } from "./user-utility.service.js";
import { UserProfileModel } from "../models/user-profile.model.js";
import { RegisterRequestDto } from "../utils/DTOs/register-request.dto.js";
import { RegisterResponseDto } from "../utils/DTOs/register-response.dto.js";
import { LoginRequestDto } from "../utils/DTOs/login.request.dto.js";
import { LoginResponseDto } from "../utils/DTOs/login.response.dto.js";
import { HttpError } from "../utils/customErrors/httpError.js";
import status from "http-status";
import {
  UserInitData,
  UserInitDataDto,
} from "../utils/DTOs/user-init-data.dto.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";
import AppBaseError from "../utils/customErrors/base.error.js";
import { IUserProfile } from "../interfaces/user-profile.interface.js";

/**
 * Service for handling user profile related activities like registration and login in.
 */
export class UserProfileService {
  private readonly logger: Logger;

  /**
   * Creates an instance of UserProfileService.
   *
   * @param {LoggerService} loggerService - The logger service to log messages.
   * @param {UserUtilityServices} utilityServices - Utility service for various user operations.
   * @param {UserProfileModel} userProfileModel - Model for interacting with the `profiles` in the DB.
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly utilityServices: UserUtilityServices,
    private readonly userProfileModel: UserProfileModel,
  ) {
    dotenv.config();
    this.logger = this.loggerService.createLogger(
      "UserProfileServiceLogger",
      "UserProfileService",
      process.env.PROFILE_SERVICE_LOG_FILE,
    );
  }

  /**
   * Registers a new user profile.
   *
   * @param {RegisterRequestDto} userData - Data required to create a new user profile.
   * @returns {Promise<RegisterResponseDto>} The response DTO with the new user's ID.
   * @throws {HttpError} If email or username is already taken or if user creation fails.
   */
  async register(userData: RegisterRequestDto): Promise<RegisterResponseDto> {
    try {
      this.logger.info(`Attempting to create new user profile.`);

      const { firstName, lastName, username, email, password } = userData;

      // Check that user does not already exist
      const checkEmail = await this.userProfileModel.fetchUserProfileBy(
        "email",
        email,
      );
      if (checkEmail) {
        this.logger.warn(`Registration with existing email attempted`);

        throw new HttpError(
          "Email taken. Kindly try with a different email address",
          status.BAD_REQUEST,
        );
      }

      const checkUsername = await this.userProfileModel.fetchUserProfileBy(
        "username",
        username,
      );
      if (checkUsername) {
        this.logger.warn(`Registration with existing username attempted`);

        throw new HttpError(
          "Username taken. Kindly try with a different username",
          status.BAD_REQUEST,
        );
      }

      // Hash user password
      const passwordHash = await this.utilityServices.hashPassword(password);

      // Create data to be stored in DB
      const userInitDataObj: UserInitData = {
        firstName,
        lastName,
        username,
        email,
        passwordHash,
      };
      const userInitData = new UserInitDataDto(userInitDataObj);

      // Create new user profile
      const newUser: InsertOneResult | null =
        await this.userProfileModel.createUserProfile(userInitData);

      if (!newUser) {
        throw new HttpError(
          "User profile creation failed. Insert was not acknowledged",
          status.INTERNAL_SERVER_ERROR,
        );
      }

      // Log successful user registration
      this.logger.info(
        `New user profile with id: ${newUser.insertedId} created successfully.`,
      );

      return new RegisterResponseDto(newUser.insertedId);
    } catch (error: unknown) {
      if (!(error instanceof AppBaseError)) {
        throw new UnexpectedError(
          `Unexpected error while trying to register new user`,
          error as Error,
          "ProfileService.register()",
        );
      }
      throw error;
    }
  }

  /**
   * Authenticates and logs in a user.
   *
   * @param {LoginRequestDto} userLoginData - Data required to authenticate and login a user.
   * @returns {Promise<LoginResponseDto>} The response DTO containing the JWT token and username.
   * @throws {HttpError} If the login credentials are invalid or incorrect.
   */
  async login(userLoginData: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const { email, password } = userLoginData;

      // check that user exists
      const user = await this.userProfileModel.fetchUserProfileBy(
        "email",
        email,
        { forLogin: true },
      );

      // If user exists, check that user password is correct
      if (user) {
        const isPasswordCorrect = await this.utilityServices.comparePassword(
          password,
          user.password_hash, // Could be undefined, cause of IUserProfile
        );
        if (!isPasswordCorrect) {
          throw new HttpError(`Incorrect password`, status.BAD_REQUEST);
        }
      } else {
        throw new HttpError(`Incorrect email`, status.BAD_REQUEST);
      }

      // create JWT
      const jwtPayload = { email };
      const token = this.utilityServices.jwtSignPayload(
        jwtPayload,
        process.env.JWT_SECRET as string,
      );

      return new LoginResponseDto(token, user.username);
    } catch (error: unknown) {
      if (!(error instanceof AppBaseError)) {
        throw new UnexpectedError(
          `Unexpected error while trying to login user`,
          error as Error,
          "ProfileService.login()",
        );
      }
      throw error;
    }
  }

  /**
   * Checks if a user profile exists based on the provided criteria (email or username).
   *
   * @param {keyof Pick<IUserProfile, "email" | "username">} checkCriteria - The field to check (either 'email' or 'username').
   * @param {string} checkValue - The value to check against (either email or username).
   * @returns {Promise<boolean>} True if the user profile exists, false otherwise.
   */
  async userProfileExists(
    checkCriteria: keyof Pick<IUserProfile, "email" | "username">,
    checkValue: string,
  ): Promise<boolean> {
    // Check that user exists
    const checkUsername = await this.userProfileModel.fetchUserProfileBy(
      checkCriteria,
      checkValue,
      { forCheck: true },
    );

    if (!checkUsername) {
      return false;
    }

    return true;
  }
}
