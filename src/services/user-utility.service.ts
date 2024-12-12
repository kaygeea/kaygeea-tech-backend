import dotenv from "dotenv";
import { hash, compare } from "bcrypt-ts";
// import { JwtPayload, sign, verify } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { IUtilityService } from "../interfaces/utility.interface.js";

const { sign, verify } = jwt;

export class UserUtilityServices implements IUtilityService {
  constructor() {
    dotenv.config();
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  async comparePassword(
    password: string,
    hash: string | undefined,
  ): Promise<boolean | undefined> {
    if (!hash) {
      return; // #TODO: Add logic to hanlde undefined.
    }
    return await compare(password, hash);
  }

  jwtSignPayload(
    payload: { id: ObjectId; email: string },
    secret: string,
  ): string {
    return sign(payload, secret, { expiresIn: process.env.TOKEN_LIFESPAN });
  }

  jwtVerifyToken(token: string, secret: string): jwt.JwtPayload | string {
    return verify(token, secret);
  }
}
