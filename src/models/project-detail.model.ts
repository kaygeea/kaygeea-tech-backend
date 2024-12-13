import { Collection, Db, ObjectId } from "mongodb";
import { IProjectDetail } from "../interfaces/project-detail.interface.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";
import { IProjectDetailFilter } from "../interfaces/project-detail-filter.interface.js";
import { ProjectDetailRequestDto } from "../utils/DTOs/project-detail.request.dto.js";

export class ProjectDetailModel {
  private readonly collection: Collection;

  constructor(private readonly dbConn: Db) {
    this.collection = this.dbConn.collection("project_details");
  }

  async fetchProjectDetailBy(
    projectDetailRequestData: ProjectDetailRequestDto,
  ): Promise<IProjectDetail | null> {
    try {
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
    } catch (error: unknown) {
      throw new UnexpectedError(
        "Unexpected error while attempting to retrieve project detail.",
        error as Error,
        "ProjectDetailModel.getProjectDetailById",
      );
    }
  }
}
