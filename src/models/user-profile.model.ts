import {
  Collection,
  Filter,
  Document,
  InsertOneResult,
  Db,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
} from "mongodb";
import { IUserProfile } from "../interfaces/user-profile.interface.js";
import { IProfileModel } from "../interfaces/profile-model.interface.js";
import { UserInitDataDto } from "../utils/DTOs/user-init-data.dto.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";
import { AddNewLsiRequestDto } from "../utils/DTOs/add-new-lsi-request.dto.js";
import { ILsiRecord } from "../interfaces/lsi-record.interface.js";

/**
 * Defines a user model for interacting with the DB and performing CRUD ops.
 */
export class UserProfileModel implements IProfileModel {
  private readonly collection: Collection<IUserProfile>;
  // private readonly logger: Logger;

  /**
   * @param {Db} dbConn - A database connection object for the target database.
   */
  constructor(private readonly dbConn: Db) {
    this.collection = this.dbConn.collection<IUserProfile>("profiles");
  }

  /**
   * Insert new user profile into the `profiles` collection.
   *
   * @param userInitData - User registration data
   * @returns The Mongo-generated `_id`
   */
  async createUserProfile(
    userInitData: UserInitDataDto,
  ): Promise<InsertOneResult<IUserProfile> | null> {
    try {
      const newUserDocument: Document = {
        first_name: userInitData.firstName,
        last_name: userInitData.lastName,
        username: userInitData.username,
        email: userInitData.email.toLowerCase(),
        password_hash: userInitData.passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Insert user data into database
      const insertOp: InsertOneResult<IUserProfile> | null =
        await this.collection.insertOne(newUserDocument as IUserProfile);

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
   * document that matches the given search criteria or throws an error if no
   * match is found
   * @param {string} fetchCriteria - A string that corresponds to a field in the document to be returned.
   * @param {string} fetchCriteriaValue - A string that corresponds to the value at the `fetchCriteria` field.
   * @returns {Promise<Array<IUserProfile>>} A promise that resolves to an array of profile objects.
   */
  async fetchUserProfileBy(
    fetchCriteria: keyof Pick<IUserProfile, "email" | "username">,
    fetchCriteriaValue: string,
    options: { forLogin?: boolean; forCheck?: boolean } = {},
  ): Promise<IUserProfile | null> {
    const { forLogin = false, forCheck = false } = options;
    try {
      const filter: Filter<IUserProfile> = {
        [fetchCriteria]: fetchCriteriaValue,
      };
      let projection: Document;

      if (forLogin) {
        projection = { password_hash: 1, username: 1, email: 1 };
      } else if (forCheck) {
        projection = { _id: 1 };
      } else {
        projection = { password_hash: 0, lsi_records: 0 };
      }

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

  async addNewLsiRecord(
    username: string,
    dbLsiData: AddNewLsiRequestDto,
  ): Promise<UpdateResult<IUserProfile>> {
    try {
      const { lsi, socialPlatformName, visitorCount } = dbLsiData;
      const lsiRecord: ILsiRecord = {
        lsi,
        s_p_n: socialPlatformName,
        count: visitorCount,
      };

      const filter: Filter<IUserProfile> = { username };

      const update: UpdateFilter<IUserProfile> = {
        $push: { lsi_records: lsiRecord },
      };

      const options: UpdateOptions = { upsert: true };

      const updateResult = await this.collection.updateOne(
        filter,
        update,
        options,
      );

      return updateResult;
    } catch (error: unknown) {
      throw new UnexpectedError(
        "Unexpected error while trying to fetch user document.",
        error as Error,
        "ProfileModel.addNewLsiRecord()",
      );
    }
  }

  async updateLsiCount(username: string, inputLsi: string): Promise<number> {
    const filter: Filter<IUserProfile> = {
      username,
      "lsi_records.lsi": inputLsi,
    };
    const update: UpdateFilter<Document> = {
      $inc: { "lsi_records.$.count": 1 },
    };

    const updateOp = await this.collection.updateOne(filter, update);

    return updateOp.modifiedCount;
  }
}
