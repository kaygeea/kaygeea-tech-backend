import { EventEmitter } from "events";
import { UserProfileService } from "../services/user-profile.service.js";
import UnexpectedError from "../utils/customErrors/unexpected.error.js";

export class UserProfileEvents {
  private readonly eventEmitter: EventEmitter;

  constructor(private readonly userProfileService: UserProfileService) {
    this.eventEmitter = new EventEmitter({ captureRejections: true });
    this.registerHandlers();
  }

  private registerHandlers() {
    // Event for when user profile is requested with LSI hashPart
    this.eventEmitter.on("full lsi used", (username: string, lsi: string) =>
      this.handleLsiCountUpdate(username, lsi),
    );

    // Error event handler to prevent uncaught exception crashes.
    this.eventEmitter.on("error", (error: Error) => {
      console.log("A mad error occurred!");
      throw new UnexpectedError(
        "Unexpected error while handling a user profile event",
        error,
        "UserProfileEvent.errorEventHandler()",
      );
    });
  }

  private async handleLsiCountUpdate(username: string, lsi: string) {
    await this.userProfileService.updateLsiCount(username, lsi);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitEvent(eventType: string, ...args: any[]) {
    this.eventEmitter.emit(eventType, ...args);
  }
}
