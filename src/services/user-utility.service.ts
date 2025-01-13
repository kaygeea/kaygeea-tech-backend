const { createHash } = await import("node:crypto");
import dotenv from "dotenv";
import { hash, compare } from "bcrypt-ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import { customAlphabet } from "nanoid";
import { IUserUtilityService } from "../interfaces/utility.interface.js";
import { socialPlatformNames } from "../utils/DTOs/create-lsi-request.dto.js";

const { sign, verify } = jwt;

/**
 * Service providing utility functions for user operations, such as hashing passwords,
 * token management, and LSI creation.
 */
export class UserUtilityServices implements IUserUtilityService {
  constructor() {
    dotenv.config();
  }

  /**
   * Hashes a password using bcrypt.
   * @param {string} password - The plaintext password to hash.
   * @returns {Promise<string>} A promise that resolves to the hashed password.
   */
  async hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  /**
   * Compares a plaintext password with a hashed password.
   * @param {string} password - The plaintext password to compare.
   * @param {string | undefined} hash - The hashed password for comparison.
   * @returns {Promise<boolean | undefined>} A promise that resolves to `true` if the passwords match, `false` otherwise, or `undefined` if the hash is not provided.
   */
  async comparePassword(
    password: string,
    hash: string | undefined,
  ): Promise<boolean | undefined> {
    if (!hash) {
      return; // TODO: Add logic to handle undefined.
    }
    return await compare(password, hash);
  }

  /**
   * Signs a payload to create a JSON Web Token (JWT).
   * @param {JwtPayload} payload - The payload to include in the token.
   * @param {string | undefined} secret - The secret key for signing the token.
   * @returns {string} The signed JWT.
   */
  jwtSignPayload(payload: JwtPayload, secret: string | undefined): string {
    return sign(payload, secret as string, {
      expiresIn: process.env.TOKEN_LIFESPAN,
    });
  }

  /**
   * Verifies a JSON Web Token (JWT) to extract its payload.
   * @param {string} token - The token to verify.
   * @param {string | undefined} secret - The secret key for verifying the token.
   * @returns {JwtPayload | string} The decoded payload if the token is valid.
   */
  jwtVerifyToken(
    token: string,
    secret: string | undefined,
  ): jwt.JwtPayload | string {
    return verify(token, secret as string);
  }

  /**
   * Creates a Link Source Identifier (LSI) based on the username and social media platform name.
   * @param {string} username - The username of the user creating the LSI.
   * @param {socialPlatformNames} socialPlatform - The social platform name to be associated with the LSI.
   * @returns {string} The generated LSI.
   */
  createLsi(username: string, socialPlatform: socialPlatformNames): string {
    const nanoid = customAlphabet(process.env.ENGLISH_ALPHAS as string, 7);
    const baseString = `${username}:${socialPlatform}`;
    const hash = createHash("md5").update(baseString).digest("hex").slice(0, 6);
    const randomPart = nanoid();
    const lsi = `${username}-${hash}_${randomPart}`;

    return lsi;
  }
}
