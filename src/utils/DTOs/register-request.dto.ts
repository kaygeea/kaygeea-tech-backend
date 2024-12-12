import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  // IsStrongPassword,
  Length,
  MinLength,
} from "class-validator";
import { BaseDto } from "./base.dto.js";

export interface RegisterRequestBody {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export class RegisterRequestDto extends BaseDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(2, 40)
  firstName!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(2, 40)
  lastName!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(2, 40)
  username!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  @IsDefined()
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  // @IsStrongPassword()
  password!: string;

  constructor(input?: RegisterRequestBody) {
    super();
    if (input) {
      this.firstName = input.firstName;
      this.lastName = input.lastName;
      this.username = input.username;
      this.email = input.email;
      this.password = input.password;
    }
  }
}
