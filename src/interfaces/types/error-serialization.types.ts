import { IUnexpectedErrorMessage } from "../error-messages/unexpected-error-message.interface.js";
import { IValidationErrorMessage } from "../error-messages/validation-error-message.interface.js";

export type SerializedError = IValidationErrorMessage | IUnexpectedErrorMessage;
