import {
  IsDefined,
  IsNotEmpty,
  IsString,
  Length,
  IsJWT,
} from "class-validator";
import { BaseDto } from "./base.dto.js";

export class LoginResponseDto extends BaseDto {
  @IsJWT()
  public token: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(2, 40)
  public username: string;

  constructor(token: string, username: string) {
    super();
    this.token = token;
    this.username = username;
  }
}
