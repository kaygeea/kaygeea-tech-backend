import { Request, Response } from "express";
import { Logger } from "winston";
import { LsiService } from "../services/lsi.service.js";
import { LoggerService } from "../services/logger.service.js";
import { asyncErrorHandler } from "../utils/middlewares/async-error-handler.js";
import {
  CreateLsiRequestDto,
  ICreateLsiRequestRequestBody,
} from "../utils/DTOs/create-lsi-request.dto.js";

export default class LsiController {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly lsiService: LsiService,
  ) {
    this.logger = this.loggerService.createLogger(
      "LsiControllerLogger",
      "LsiController",
    );
  }

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
