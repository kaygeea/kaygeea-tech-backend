import {
  IsDefined,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import {
  RegisterRequestDto,
  RegisterRequestBody,
} from "./register-request.dto.js";

export type UserInitData = Omit<RegisterRequestBody, "password"> & {
  passwordHash: string;
};

export class UserInitDataDto extends RegisterRequestDto {
  @IsOptional()
  @IsEmpty()
  declare password: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  passwordHash!: string;

  constructor(input: UserInitData) {
    super();
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.username = input.username;
    this.email = input.email;
    this.passwordHash = input.passwordHash;
  }
}
