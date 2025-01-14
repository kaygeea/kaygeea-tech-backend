import dotenv from "dotenv";
import {
  IsDefined,
  IsIn,
  IsLowercase,
  IsNotEmpty,
  IsString,
  Length,
} from "class-validator";
import { BaseDto } from "./base.dto.js";

dotenv.config();

const allowedSocialPlatformNames = (
  process.env.ALLOWED_SOCIAL_PLATFORM_NAMES || ""
)
  .split(",")
  .map((spn) => spn.trim()) as readonly string[];

export type socialPlatformNames = (typeof allowedSocialPlatformNames)[number];

export interface ICreateLsiRequestRequestBody {
  username: string;
  socialMediaPlatform: socialPlatformNames;
}

export class CreateLsiRequestDto extends BaseDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(2, 40)
  username!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  @IsIn(allowedSocialPlatformNames, {
    message: "'$value' is not a valid $property",
  })
  socialMediaPlatform!: socialPlatformNames;

  constructor(input: ICreateLsiRequestRequestBody) {
    super();
    if (input) {
      this.socialMediaPlatform = input.socialMediaPlatform;
      this.username = input.username;
    }
  }
}
