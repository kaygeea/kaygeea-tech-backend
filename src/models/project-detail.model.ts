import { Collection, ObjectId, Db, Filter, Document } from "mongodb";
import { IProjectDetail } from "../interfaces/project-detail.interface.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";

export class ProjectDetailModel {
  private readonly collection: Collection;

  constructor(private readonly dbConn: Db) {
    this.collection = this.dbConn.collection("project_details");
  }

  async fetchProjectDetailById(
    fetchCriteriaValue: string,
  ): Promise<IProjectDetail | null> {
    try {
      const filter: Filter<Document> = {
        _id: new ObjectId(fetchCriteriaValue),
      };

      const projectDetail: IProjectDetail | null =
        await this.collection.findOne<IProjectDetail>(filter);

      return projectDetail;
    } catch (error: unknown) {
      throw new UnexpectedError(
        "Unexpected error while attempting to retrieve project detail.",
        error as Error,
        "ProjectDetailModel.getProjectDetailById",
      );
    }
  }
}
