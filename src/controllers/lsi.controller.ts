import { Request, Response } from "express";
import { Logger } from "winston";
import { LsiService } from "../services/lsi.service.js";
import { LoggerService } from "../services/logger.service.js";
import { asyncErrorHandler } from "../utils/middlewares/async-error-handler.js";
import {
  CreateLsiRequestDto,
  ICreateLsiRequestRequestBody,
} from "../utils/DTOs/create-lsi-request.dto.js";

/**
 * Controller for managing requests related to Link Source Identifier (LSI) system.
 */
export default class LsiController {
  private readonly logger: Logger;

  /**
   * Initializes the LsiController.
   *
   * @param {LoggerService} loggerService - Service for profiling requests.
   * @param {LsiService} lsiService - Service for managing LSIs.
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly lsiService: LsiService,
  ) {
    this.logger = this.loggerService.createLogger(
      "LsiControllerLogger",
      "LsiController",
    );
  }

  /**
   * Handles requests to create a new Link Source Identifier (LSI).
   *
   * @param {Request} req - The HTTP request object, containing LSI data in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} - Responds with the generated LSI.
   * @throws {Error} - Propagates any errors encountered during the LSI creation process.
   */
  createLsi = asyncErrorHandler(async (req: Request, res: Response) => {
    const profiler = this.logger.startTimer();

    const lsiData = new CreateLsiRequestDto(
      req.body as ICreateLsiRequestRequestBody,
    );
    const lsi = await this.lsiService.createLinkSourceIdentifier(lsiData);

    profiler.done({
      message: `${req.method} Request to ${req.url} processed.`,
    });

    res.status(201).json({
      message: "New social link generated",
      link: lsi,
    });
  });
}
