import dotenv from "dotenv";
import { ObjectId, InsertOneResult } from "mongodb";
import { Logger } from "winston";
import { LoggerService } from "./logger.service.js";
import { UserUtilityServices } from "./user-utility.service.js";
import { ProfileModel } from "../models/profile.model.js";
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

export class ProfileService {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly utilityServices: UserUtilityServices,
    private readonly profileModel: ProfileModel,
  ) {
    dotenv.config();
    this.logger = this.loggerService.createLogger(
      "ProfileServiceLogger",
      "ProfileService",
      process.env.PROFILE_SERVICE_LOG_FILE,
    );
  }

  async register(userData: RegisterRequestDto): Promise<RegisterResponseDto> {
    try {
      this.logger.info(`Attempting to create new user profile.`);

      const { firstName, lastName, username, email, password } = userData;

      // Check that user does not already exist
      const checkEmail = await this.profileModel.fetchUserProfileBy(
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

      const checkUsername = await this.profileModel.fetchUserProfileBy(
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
        await this.profileModel.createUserProfile(userInitData);

      if (!newUser) {
        this.logger.error(
          "User profile creation failed. Insert was not acknowledged",
        );

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

  async login(userLoginData: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const { email, password } = userLoginData;

      // check that user exists
      const user = await this.profileModel.fetchUserProfileBy(
        "email",
        email,
        true,
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
        throw new HttpError(`Incorrect email.`, status.BAD_REQUEST);
      }

      // create JWT
      const jwtPayload = { id: new ObjectId(user._id), email };
      const token = this.utilityServices.jwtSignPayload(
        jwtPayload,
        process.env.SECRET_STR as string,
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
}
