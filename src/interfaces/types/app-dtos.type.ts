import { RegisterRequestDto } from "../../utils/DTOs/register-request.dto.js";
import { RegisterResponseDto } from "../../utils/DTOs/register-response.dto.js";
import { LoginRequestDto } from "../../utils/DTOs/login.request.dto.js";
import { LoginResponseDto } from "../../utils/DTOs/login.response.dto.js";
import { UserInitDataDto } from "../../utils/DTOs/user-init-data.dto.js";
// import { AddAboutRequestDto } from "../../utils/DTOs/add-about.request.dto.js";

export type AppDto =
  | RegisterRequestDto
  | RegisterResponseDto
  | LoginRequestDto
  | LoginResponseDto
  | UserInitDataDto;
// | AddAboutRequestDto;
