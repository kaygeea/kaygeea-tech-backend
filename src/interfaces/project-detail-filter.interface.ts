import { ObjectId } from "mongodb";

export interface IProjectDetailFilter {
  _id?: ObjectId;
  name: string;
}
