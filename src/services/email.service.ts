import dotenv from "dotenv";
import { Transporter, createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer/index.js";
import { Logger } from "winston";
import { LoggerService } from "./logger.service.js";
import { LsiMilestoneNotificationDto } from "../utils/DTOs/lsi-milestone-notification.dto.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";

/**
 * Service for handling email-related  operations.
 */
export class EmailService {
  private readonly logger: Logger;
  private readonly transporter: Transporter;

  /**
   * Creates an instance of EmailService.
   * @param {LoggerService} loggerService - The logger service used for logging messages.
   */
  constructor(private readonly loggerService: LoggerService) {
    dotenv.config();
    this.logger = this.loggerService.createLogger(
      "Email Service Logger",
      "EmailService",
    );

    this.transporter = createTransport({
      host: process.env.EMAIL_HOST as string,
      port: parseInt(process.env.EMAIL_PORT as string),
      auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASSWORD as string,
      },
    });
  }

  /**
   * Sends an LSI (Link Source Identifier) milestone notification email.
   * @param {LsiMilestoneNotificationDto} notificationData - The data required to compose the notification email.
   * @returns {Promise<void>} A promise that resolves when the email is successfully sent.
   * @throws {UnexpectedError} Throws an error if the email sending operation fails.
   */
  async sendLsiMilestoneNotification(
    notificationData: LsiMilestoneNotificationDto,
  ): Promise<void> {
    try {
      const mailOptions: Mail.Options = {
        from: process.env.NOTIFICATION_EMAIL_SENDER,
        to: `${notificationData.userEmail}`,
        subject: `${notificationData.lsiRecord.s_p_n} Visitor Milestone Target Reached!!`,
        text: `Congratulations ${notificationData.username}!! \n\nYou just got visitor number ${notificationData.lsiMilestoneTarget} from ${notificationData.lsiRecord.s_p_n} to your portfolio website. More wins!!`,
      };

      await this.transporter.sendMail(mailOptions);

      this.logger.info(
        "LSI milestone target notification email sent successfully",
      );
    } catch (error: unknown) {
      throw new UnexpectedError(
        "Unexpected error while attempting to send LSI milestone notification email",
        error as Error,
        "EmailService.sendLsiMilestoneNotification()",
      );
    }
  }
}
