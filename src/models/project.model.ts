import {
  Collection,
  Filter,
  ObjectId,
  PushOperator,
  UpdateResult,
} from "mongodb";
import { Logger } from "winston";
import { LoggerService } from "../services/logger.service.js";
import { IMongoDatabase } from "../interfaces/database.interface.js";
// import { CreateProjectRequestDto } from "../utils/DTOs/create-project.request.dto.js";
import { IUserProfile } from "../interfaces/user-profile.interface.js";
import { IProject } from "../interfaces/project.interface.js";

export class ProjectModel {
  private readonly collection: Collection<IUserProfile>;
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly dbService: IMongoDatabase,
  ) {
    this.collection = this.dbService.dbConn.collection("project_details");
    this.logger = this.loggerService.createLogger(
      "ProjectModelLogger",
      "ProjectModel",
    );
  }

  async addNewProject(
    profileId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectData: any, // CreateProjectRequestDto,
  ): Promise<UpdateResult> {
    try {
      const newProject: IProject = {
        _id: new ObjectId(),
        demo: projectData.demo || undefined,
        description: projectData.description,
        name: projectData.name || undefined,
        title: projectData.title,
        technologies: projectData.technologies || undefined,
        demo_type: projectData.demo_type || undefined,
        link: projectData.link || undefined,
        status: projectData.status,
        started_on: projectData.started_on || new Date().toISOString(),
        first_push: projectData.first_push || undefined,
        last_push: projectData.last_push || undefined,
        deployment_date: projectData.deployment_date || undefined,
      };
      // upsert new project doc as array
      const query: Filter<IUserProfile> = {
        _id: new ObjectId(profileId),
        "projects.name": projectData.name,
      };

      const update: PushOperator<IUserProfile> = {
        $push: { projects: newProject },
      };

      const updateOp: UpdateResult<IUserProfile> =
        await this.collection.updateOne(query, update, { upsert: true });

      return updateOp;
    } catch (error: unknown) {
      this.logger.error(
        `Unexpected error occurred while trying to insert new project document: ${(error as Error).message}`,
      );
      throw new Error("Unexpected Error Occurred", { cause: error });
    }
  }

  async getProjectById() {
    // fetch a single project document by a given criteria
  }

  async getProjectsBy() {
    // fetch all projects that match a given query filter
  }

  async getAllProjects() {
    // fetch all projects on a profile
  }

  async updateProject() {
    // update a particular project document
  }

  async deleteProject() {
    // delete a particular project
  }
}
