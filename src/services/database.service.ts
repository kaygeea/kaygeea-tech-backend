import dotenv from "dotenv";
import { Db, MongoClient, ServerApiVersion } from "mongodb";
import { IMongoDatabase } from "../interfaces/database.interface.js";
import { LoggerService } from "./logger.service.js";
import { HttpError } from "../utils/customErrors/httpError.js";
import { Logger } from "winston";

/**
 * Singleton service for managing MongoDB database connections.
 */
class DatabaseService implements IMongoDatabase {
  private static instance: DatabaseService;
  private readonly client: MongoClient;
  private readonly logger: Logger;
  public readonly dbConn: Db;

  /**
   * Initializes the `DatabaseService` with the provided logger service.
   * @param {LoggerService} loggerService - The logger service used for logging database operations.
   * @throws {HttpError} Throws an error if the MongoDB client or database connection cannot be created.
   */
  private constructor(private readonly loggerService: LoggerService) {
    dotenv.config();
    this.logger = this.loggerService.createLogger(
      "DatabaseServiceLogger",
      "DatabaseService",
      process.env.DATABASE_SERVICE_LOG_FILE,
    );
    this.client = this.initClient(
      process.env.MONGODB_CONN_URI as string,
      parseInt(process.env.MONGODB_MAX_CONNECTION_POOL_SIZE as string),
    );
    this.dbConn = this.connectToDb(this.client, process.env.DB_NAME as string);
  }

  /**
   * Initializes and returns a MongoDB client with the specified connection string.
   * @private
   * @param {string} connectionString - The MongoDB connection string.
   * @returns {MongoClient} The initialized MongoDB client.
   * @throws {HttpError} Throws an error if the client cannot be created.
   */
  private initClient(
    connectionString: string,
    maxPoolSize: number,
  ): MongoClient {
    const client = new MongoClient(connectionString, {
      maxPoolSize: maxPoolSize,
      minPoolSize: 0,
      maxIdleTimeMS: Infinity,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      // compressors: ["snappy"],
    });

    if (!client) {
      this.logger.error("Failed to create MongoDB client.");
      throw new HttpError(
        "Failed to create MongoDB client. Kindly try again later",
        500,
      );
    }
    return client;
  }

  /**
   * Establishes and returns a connection to the specified database.
   * @private
   * @param {MongoClient} client - The MongoDB client.
   * @param {string} dbName - The name of the database.
   * @returns {Db} The connected database instance.
   * @throws {HttpError} Throws an error if the connection cannot be established.
   */
  private connectToDb(client: MongoClient, dbName: string): Db {
    const db = client.db(dbName);

    if (!db) {
      this.logger.error("Failed to establish connection to database");
      throw new HttpError(
        "Connection to database failed. Kindly try again later",
        500,
      );
    }
    this.logger.info("Connection to Database successfully established");
    return db;
  }

  /**
   * Retrieves the singleton instance of the `DatabaseService`.
   * @returns {DatabaseService} The singleton instance of the database service.
   */
  static getInstance(): DatabaseService {
    if (!this.instance) {
      this.instance = new DatabaseService(new LoggerService());
    }
    return this.instance;
  }
}

/**
 * Exported singleton instance of the `DatabaseService`.
 */
export const DbService: DatabaseService = DatabaseService.getInstance();
