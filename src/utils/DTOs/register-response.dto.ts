import { ObjectId } from "mongodb";
import { BaseDto } from "./base.dto.js";

export class RegisterResponseDto extends BaseDto {
  insertedId: ObjectId;
  registrationDate: Date;

  constructor(insertedId: ObjectId) {
    super();
    this.insertedId = insertedId;
    this.registrationDate = insertedId.getTimestamp();
  }
}
