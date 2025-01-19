import dotenv from "dotenv";
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
import { AddNewLsiRequestDto } from "../utils/DTOs/add-new-lsi-request.dto.js";
import { ILsiRecord } from "../interfaces/lsi-record.interface.js";
import { socialPlatformNames } from "../utils/DTOs/create-lsi-request.dto.js";

/**
 * Model class for interacting with the `profiles` collection in MongoDB.
 */
export class UserProfileModel implements IProfileModel {
  private readonly collection: Collection<IUserProfile>;

  /**
   * Creates an instance of UserProfileModel.
   * @param {Db} dbConn - The MongoDB database connection.
   */
  constructor(private readonly dbConn: Db) {
    dotenv.config();
    this.collection = this.dbConn.collection<IUserProfile>(
      process.env.PROFILES_COLLECTION as string,
    );
  }

  /**
   * Creates a new user profile in the database.
   * @param {UserInitDataDto} userInitData - The initial data for the new user.
   * @returns {Promise<InsertOneResult<IUserProfile> | null>} A promise resolving to the result of the insert operation, or null if it fails.
   */
  async createUserProfile(
    userInitData: UserInitDataDto,
  ): Promise<InsertOneResult<IUserProfile> | null> {
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
  }

  /**
   * Fetches a user profile based on a specified criterion (e.g., email or username).
   * @param {"email" | "username"} fetchCriteria - The field to filter by.
   * @param {string} fetchCriteriaValue - The value of the field to filter by.
   * @param {Object} [options={}] - Additional options for the query.
   * @param {boolean} [options.forLogin=false] - Whether to fetch data for login purposes.
   * @param {boolean} [options.forCheck=false] - Whether to fetch minimal data for verification.
   * @returns {Promise<IUserProfile | null>} A promise resolving to the user profile if found, or null otherwise.
   */
  async fetchUserProfileBy(
    fetchCriteria: keyof Pick<IUserProfile, "email" | "username">,
    fetchCriteriaValue: string,
    options: { forLogin?: boolean; forCheck?: boolean } = {},
  ): Promise<IUserProfile | null> {
    const { forLogin = false, forCheck = false } = options;

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
  }

  /**
   * Adds a new LSI (Link Source Identifier) record to the user's profile.
   * @param {string} username - The username of the user.
   * @param {AddNewLsiRequestDto} dbLsiData - The LSI data to be added.
   * @returns {Promise<UpdateResult<IUserProfile>>} A promise resolving to the result of the update operation.
   */
  async addNewLsiRecord(
    username: string,
    dbLsiData: AddNewLsiRequestDto,
  ): Promise<UpdateResult<IUserProfile>> {
    const { lsi, socialPlatformName, visitorCount, generationDate } = dbLsiData;

    const lsiRecord: ILsiRecord = {
      lsi,
      s_p_n: socialPlatformName,
      count: visitorCount,
      gen_date: generationDate,
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
  }

  /**
   * Updates the count for a specific LSI record in the user's profile.
   * @param {string} username - The username of the user.
   * @param {string} inputLsi - The LSI pointing to the LSI record to update.
   * @returns {Promise<ILsiRecord | undefined>} A promise resolving to the updated LSI record, or undefined if not found.
   */
  async updateLsiCount(
    username: string,
    inputLsi: string,
  ): Promise<ILsiRecord | undefined> {
    const filter: Filter<IUserProfile> = {
      username,
      "lsi_records.lsi": inputLsi,
    };
    const update: UpdateFilter<Document> = {
      $inc: { "lsi_records.$.count": 1 },
    };

    const options: Document = {
      returnDocument: "after",
      projection: { lsi_records: 1, _id: 0 },
    };

    const updateOp = await this.collection.findOneAndUpdate(
      filter,
      update,
      options,
    );

    if (!updateOp) {
      return undefined;
    }

    const returnedLsiRecords = updateOp as unknown as {
      lsi_records: ILsiRecord[];
    };

    const updatedLsiRecord: ILsiRecord | undefined =
      returnedLsiRecords.lsi_records.find(
        (lsiRecord) => lsiRecord.lsi === inputLsi,
      );

    return updatedLsiRecord;
  }

  /**
   * Retrieves a specific LSI record based on the social media platform.
   * @param {string} username - The username of the user.
   * @param {socialPlatformNames} socialMediaPlatform - The social media platform name.
   * @returns {Promise<ILsiRecord | null>} A promise resolving to the matching LSI record, or null if not found.
   */
  async getLsiRecord(
    username: string,
    socialMediaPlatform: socialPlatformNames,
  ): Promise<ILsiRecord | null> {
    const filter: Filter<IUserProfile> = {
      username,
      "lsi_records.s_p_n": socialMediaPlatform,
    };

    // Return only the first document in the array that matches
    const projection: Document = { "lsi_records.$": 1 };

    return (await this.collection.findOne(
      filter,
      projection,
    )) as unknown as ILsiRecord;
  }

  /**
   * Checks if an LSI milestone target has been reached for a user.
   * @param {string} username - The username of the user.
   * @param {string} lsi - The LSI to check.
   * @param {string} lsiMilestoneTarget - The milestone target count.
   * @returns {Promise<ILsiRecord | undefined>} A promise resolving to the LSI record if the milestone is reached, or undefined otherwise.
   */
  async checkForLsiMilestoneReached(
    username: string,
    lsi: string,
    lsiMilestoneTarget: string,
  ): Promise<ILsiRecord | undefined> {
    const filter: Filter<IUserProfile> = {
      username,
      "lsi_records.lsi": lsi,
      "lsi_records.count": { $eq: lsiMilestoneTarget },
    };

    const projection: Document = { "lsi_records.$": 1 };

    const data = (await this.collection.findOne(
      filter,
      projection,
    )) as unknown as ILsiRecord;

    return data;
  }
}
