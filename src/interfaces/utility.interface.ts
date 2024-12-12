import { ObjectId } from "mongodb";
import { JwtPayload } from "jsonwebtoken";

export interface IUtilityService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean | undefined>;
  jwtSignPayload(
    payload: { id: ObjectId; email: string },
    secret: string,
  ): string;
  jwtVerifyToken(token: string, secret: string): JwtPayload | string;
}
