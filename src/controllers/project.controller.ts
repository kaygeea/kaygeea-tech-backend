// import { Request, Response } from "express";
// import { getProjectDetailById } from "../models/project.model.js";
// import { InternalServerError } from "../utils/customErrors/InternalServerError.js";
// import { NotFoundError } from "../utils/customErrors/NotFoundError.js";
// import { UnauthorizedError } from "../utils/customErrors/UnauthorisedError.js";

// class ProjectController {
//   static async loadProjectDetailPage(req: Request, res: Response) {
//     const projectDetailId = req.params.projectDetailId;
//     const projectName = req.params.projectName;
//     try {
//       const projectDetails = await getProjectDetailById(
//         projectName,
//         projectDetailId,
//       );
//       res.status(200).json(projectDetails);
//     } catch (error: unknown) {
//       switch (true) {
//         case error instanceof NotFoundError:
//           res.status(error.statusCode).json(error.message);
//           break;
//         case error instanceof UnauthorizedError:
//           res.status(error.statusCode).json(error.message);
//           break;
//         case error instanceof InternalServerError:
//           res.status(error.statusCode).json(error.message);
//           break;
//       }
//     }
//   }
// }

// export default ProjectController;
