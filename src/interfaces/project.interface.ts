import { ObjectId } from "mongodb";
import { DemoType } from "./enums/demo-type.enum.js";
import { ProjectStatus } from "./enums/project-status.enum.js";

export interface IProject {
  _id: ObjectId | string;
  demo?: string;
  description: string;
  name?: string;
  title: string;
  technologies?: string[];
  demo_type?: DemoType;
  link?: string;
  details_id?: string;
  status: ProjectStatus;
  started_on: Date;
  first_push?: Date;
  last_push?: Date;
  deployment_date?: Date;
}
