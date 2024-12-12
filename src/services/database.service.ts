import dotenv from "dotenv";
import { Db, MongoClient, ServerApiVersion } from "mongodb";
import { IMongoDatabase } from "../interfaces/database.interface.js";
import { LoggerService } from "./logger.service.js";
import { HttpError } from "../utils/customErrors/httpError.js";
import { Logger } from "winston";

/**
 * This class exists as a singleton service to extend database related services
 * to other parts of the app. It is designed to work specifically with MongoDB.
 *
 */
class DatabaseService implements IMongoDatabase {
  private static instance: DatabaseService;
  private readonly client: MongoClient;
  private readonly logger: Logger;
  public readonly dbConn: Db;

  constructor(private readonly loggerService: LoggerService) {
    dotenv.config();
    this.logger = this.loggerService.createLogger(
      "DatabaseServiceLogger",
      "DatabaseService",
      process.env.DATABASE_SERVICE_LOG_FILE,
    );
    this.client = this.initClient(process.env.MONGODB_CONN_URI as string);
    this.dbConn = this.connectToDb(this.client, process.env.DB_NAME as string);

    // this.client.on("connectionPoolCreated", () => {
    //   this.logger.info("New connection pool created");
    // });

    // this.client.on("connectionCheckedIn", () => {
    //   this.logger.info("New connection checked into connection pool");
    // });

    // this.client.on("connectionCheckedOut", () => {
    //   this.logger.info("Used connection checked out of connection pool");
    // });
  }

  /**
   * This method creates an instance of a MongoClient and returns same
   * on a successful creation. The client is set up with a max connection pool
   * of 5 connections.
   *
   * @param {string} connectionString - The mongoDB connection URI
   *
   * @returns {MongoClient} An instance of a MongoClient.
   * @throws An internal server error if the operation fails.
   */
  private initClient(connectionString: string): MongoClient {
    const client = new MongoClient(connectionString, {
      maxPoolSize: 5,
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
   * Establishes a connection with a database.
   * @param {MongoClient} client - A MongoClient object.
   * @returns A mongoDB database connection.
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
   * Returns a singleton instance of the DatabaseService.
   * @returns An instance of the DatabaseService.
   */
  static getInstance(): DatabaseService {
    if (!this.instance) {
      this.instance = new DatabaseService(new LoggerService());
    }
    return this.instance;
  }
}

export const DbService: DatabaseService = DatabaseService.getInstance();
