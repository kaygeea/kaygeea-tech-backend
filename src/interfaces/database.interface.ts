import { Db } from "mongodb";

export interface IMongoDatabase {
  dbConn: Db;
}
