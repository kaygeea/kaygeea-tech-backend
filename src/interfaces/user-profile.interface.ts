import { ObjectId } from "mongodb";
import { IEducation } from "./education.interface.js";
import { IProject } from "./project.interface.js";
import { ISkill } from "./skill.interface.js";

export interface IUserProfile {
  _id: ObjectId | string;
  firstName: string;
  lastName: string;
  otherNames?: Array<string>;
  username: string;
  title?: Array<string>;
  resume?: string;
  email: string;
  password_hash?: string;
  headlinePhoto?: string;
  about?: string;
  skills?: Array<ISkill>;
  projects?: Array<IProject>;
  education?: Array<IEducation>;
  contactInfo?: { [medium: string]: string };
  logo?: { [mode: string]: string };
  created_at: Date;
  updated_at: Date;
}
