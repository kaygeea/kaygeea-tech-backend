import { Collection, Filter, Document, InsertOneResult, Db } from "mongodb";
import { IUserProfile } from "../interfaces/user-profile.interface.js";
import { IProfileModel } from "../interfaces/profile-model.interface.js";
import { UserInitDataDto } from "../utils/DTOs/user-init-data.dto.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";

/**
 * Defines a user model for interacting with the DB and performing CRUD ops.
 */
export class ProfileModel implements IProfileModel {
  private readonly collection: Collection;
  // private readonly logger: Logger;

  /**
   * @param {Db} dbConn - A database connection object for the target database.
   */
  constructor(private readonly dbConn: Db) {
    this.collection = this.dbConn.collection("profiles");
  }

  /**
   * Insert new user profile into the `profiles` collection.
   *
   * @param userInitData - User registration data
   * @returns The Mongo-generated `_id`
   */
  async createUserProfile(
    userInitData: UserInitDataDto,
  ): Promise<InsertOneResult | null> {
    try {
      const newUserDocument: Document = {
        first_name: userInitData.firstName,
        last_name: userInitData.lastName,
        username: userInitData.username,
        email: userInitData.email.toLowerCase(),
        password_hash: userInitData.passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert user data into database
      const insertOp: InsertOneResult | null =
        await this.collection.insertOne(newUserDocument);

      return insertOp;
    } catch (error: unknown) {
      throw new UnexpectedError(
        "Unexpected error while trying to insert new user document",
        error as Error,
        "ProfileModel.createUserProfile()",
      );
    }
  }

  /**
   * Retrieve a user profile by a given criteria. The criteria options are:
   * 1. email
   * 2. username
   *
   * Search the relevant collection in the database and return the first
   * document that matches the given search criteria or thows an error if no
   * match is found
   * @param {string} fetchCriteria - A string that corresponds to a field in the document to be returned.
   * @param {string} fetchCriteriaValue - A string that corresponds to the value at the `fetchCriteria` field.
   * @returns {Promise<Array<IUserProfile>>} A promise that resolves to an array of profile objects.
   */
  async fetchUserProfileBy(
    fetchCriteria: keyof Pick<IUserProfile, "email" | "username">,
    fetchCriteriaValue: string,
    forLogin = false,
  ): Promise<IUserProfile | null> {
    try {
      const filter: Filter<Document> = { [fetchCriteria]: fetchCriteriaValue };
      const projection: Document = forLogin
        ? { password_hash: 1, username: 1, email: 1 }
        : { password_hash: 0 };

      const userProfile: IUserProfile | null =
        await this.collection.findOne<IUserProfile>(filter, { projection });
      return userProfile;
    } catch (error: unknown) {
      throw new UnexpectedError(
        "Unexpected error while trying to fetch user document.",
        error as Error,
        "ProfileModel.fetchUserProfileBy()",
      );
    }
  }
}
