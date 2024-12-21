const { createHash } = await import("node:crypto");
import dotenv from "dotenv";
import { hash, compare } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { customAlphabet } from "nanoid";
import { IUtilityService } from "../interfaces/utility.interface.js";
import { socialPlatformNames } from "../utils/DTOs/create-lsi-request.dto.js";

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
      return; // #TODO: Add logic to handle undefined.
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

  createLsi(username: string, socialPlatform: socialPlatformNames): string {
    const nanoid = customAlphabet(process.env.ENGLISH_ALPHAS as string, 7);
    const baseString = `${username}:${socialPlatform}`;
    const hash = createHash("md5").update(baseString).digest("hex").slice(0, 6);
    const randomPart = nanoid();
    const lsi = `${username}-${hash}_${randomPart}`;

    return lsi;
  }
}
