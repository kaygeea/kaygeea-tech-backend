import { EventEmitter } from "events";
import { LsiService } from "../services/lsi.service.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";
import { LsiMilestoneNotificationDto } from "../utils/DTOs/lsi-milestone-notification.dto.js";

/**
 * Class for managing user profile-related events.
 */
export class UserProfileEvents {
  private readonly eventEmitter: EventEmitter;

  /**
   * Initializes the UserProfileEvents instance.
   *
   * @param {LsiService} lsiService - Service for managing LSIs and their associated operations.
   */
  constructor(private readonly lsiService: LsiService) {
    this.eventEmitter = new EventEmitter({ captureRejections: true });
    this.registerHandlers();
  }

  /**
   * Registers event handlers for specific user profile events.
   * - `full lsi used`: Triggered when a user profile is requested with an LSI hash part.
   * - `lsi milestone reached`: Triggered when an LSI milestone is achieved.
   * - `error`: Handles unexpected errors during event processing.
   *
   * @private
   */
  private registerHandlers() {
    // Event for when user profile is requested with LSI hashPart
    this.eventEmitter.on(
      "full lsi used",
      (email: string, username: string, lsi: string) =>
        this.handleLsiCountUpdate(email, username, lsi),
    );

    this.eventEmitter.on(
      "lsi milestone reached",
      (notificationData: LsiMilestoneNotificationDto) =>
        this.handleLsiMilestoneReached(notificationData),
    );

    // Error event handler to prevent uncaught exception crashes.
    this.eventEmitter.on("error", (error: Error) => {
      throw new UnexpectedError(
        "Unexpected error while handling a user profile event",
        error,
        "UserProfileEvent.errorEventHandler()",
      );
    });
  }

  /**
   * Handles updates to LSI counts for a user.
   * Emits the `lsi milestone reached` event if a milestone target is reached,
   * upon an LSI count update.
   *
   * @private
   * @param {string} email - The user's email address.
   * @param {string} username - The user's username.
   * @param {string} lsi - The LSI value.
   * @returns {Promise<void>} - Resolves when the LSI count update is processed.
   */
  private async handleLsiCountUpdate(
    email: string,
    username: string,
    lsi: string,
  ) {
    const isLsiMilestoneReached = await this.lsiService.updateLsiCount(
      email,
      username,
      lsi,
    );

    if (isLsiMilestoneReached) {
      this.emitEvent("lsi milestone reached", isLsiMilestoneReached);
    }
  }

  /**
   * Handles notifications when an LSI milestone target is reached.
   *
   * @private
   * @param {LsiMilestoneNotificationDto} notificationData - Data for the milestone notification.
   * @returns {Promise<void>} - Resolves when the notification process completes.
   */
  private async handleLsiMilestoneReached(
    notificationData: LsiMilestoneNotificationDto,
  ) {
    await this.lsiService.notifyOnLsiMilestone(notificationData);
  }

  /**
   * Emits a custom event to the event emitter.
   *
   * @param {string} eventType - The type of event to emit.
   * @param {...any[]} args - The arguments to pass to the event listeners.
   * @returns {void}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitEvent(eventType: string, ...args: any[]) {
    this.eventEmitter.emit(eventType, ...args);
  }
}
