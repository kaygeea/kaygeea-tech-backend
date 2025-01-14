import {
  IsDate,
  IsDefined,
  IsEmpty,
  IsNotEmpty,
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
  generationDate: Date;
}

export class AddNewLsiRequestDto extends BaseDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(2, 40)
  username!: string;

  @IsDefined()
  @IsNotEmpty()
  lsi!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  socialPlatformName!: socialPlatformNames;

  @IsEmpty()
  visitorCount!: number;

  @IsDefined()
  @IsDate()
  generationDate!: Date;

  constructor(input: IAddNewLsiRequestBody) {
    super();
    if (input) {
      this.username = input.username;
      this.lsi = input.lsi;
      this.socialPlatformName = input.socialPlatformName;
      this.visitorCount = 0;
      this.generationDate = input.generationDate;
    }
  }
}
