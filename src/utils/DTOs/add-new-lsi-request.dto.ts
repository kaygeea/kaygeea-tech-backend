import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { BaseDto } from "./base.dto.js";
import { socialPlatformNames } from "./create-lsi-request.dto.js";

export interface IAddNewLsiRequestBody {
  username: string;
  lsi: string;
  socialPlatformName: socialPlatformNames;
  visitorCount?: number;
}

export class AddNewLsiRequestDto extends BaseDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(2, 40)
  username!: string;

  @IsDefined()
  @IsNotEmpty()
  // IsHash()
  lsi!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  socialPlatformName!: socialPlatformNames;

  @IsOptional()
  @IsNumber()
  visitorCount!: number;

  constructor(input: IAddNewLsiRequestBody) {
    super();
    if (input) {
      this.username = input.username;
      this.lsi = input.lsi;
      this.socialPlatformName = input.socialPlatformName;
      this.visitorCount = 0;
    }
  }
}
