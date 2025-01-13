import { ObjectId } from "mongodb";
import { JwtPayload } from "jsonwebtoken";
import { socialPlatformNames } from "../utils/DTOs/create-lsi-request.dto.js";

export interface IUserUtilityService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean | undefined>;
  jwtSignPayload(
    payload: { id: ObjectId; email: string },
    secret: string,
  ): string;
  jwtVerifyToken(token: string, secret: string): JwtPayload | string;
  createLsi(username: string, socialPlatform: socialPlatformNames): string;
}
