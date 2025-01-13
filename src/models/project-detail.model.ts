import dotenv from "dotenv";
import { Collection, Db, ObjectId } from "mongodb";
import { IProjectDetail } from "../interfaces/project-detail.interface.js";
import { IProjectDetailFilter } from "../interfaces/project-detail-filter.interface.js";
import { ProjectDetailRequestDto } from "../utils/DTOs/project-detail.request.dto.js";

/**
 * Model class for interacting with the `project details` collection in MongoDB.
 */
export class ProjectDetailModel {
  private readonly collection: Collection;

  /**
   * Creates an instance of ProjectDetailModel.
   * @param {Db} dbConn - The MongoDB database connection.
   */
  constructor(private readonly dbConn: Db) {
    dotenv.config();
    this.collection = this.dbConn.collection(
      process.env.PROJECT_DETAIL_COLLECTION as string,
    );
  }

  /**
   * Fetches a project detail by the provided request data.
   * @param {ProjectDetailRequestDto} projectDetailRequestData - The data used to filter the project details.
   * @returns {Promise<IProjectDetail | null>} A promise that resolves to the project detail if found, or null if not found.
   */
  async fetchProjectDetailBy(
    projectDetailRequestData: ProjectDetailRequestDto,
  ): Promise<IProjectDetail | null> {
    const { projectDetailId, projectName } = projectDetailRequestData;
    let filter: IProjectDetailFilter;

    if (projectDetailId) {
      filter = { _id: new ObjectId(projectDetailId), name: projectName };
    } else {
      filter = { name: projectName };
    }

    const projectDetail: IProjectDetail | null =
      await this.collection.findOne<IProjectDetail>(filter);

    return projectDetail;
  }
}
