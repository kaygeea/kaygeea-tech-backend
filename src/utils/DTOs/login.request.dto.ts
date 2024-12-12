import { IsDefined, IsEmail, IsNotEmpty, IsString } from "class-validator";
import { BaseDto } from "./base.dto.js";

export interface LoginRequestBody {
  email: string;
  password: string;
}

export class LoginRequestDto extends BaseDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password!: string;

  constructor(input?: LoginRequestBody) {
    super();
    if (input) {
      this.email = input.email;
      this.password = input.password;
    }
  }
}
