import { ILsiRecord } from "../../interfaces/lsi-record.interface.js";
import { BaseDto } from "./base.dto.js";

export class LsiMilestoneNotificationDto extends BaseDto {
  lsiRecord: ILsiRecord;
  username: string;
  userEmail: string;
  lsiMilestoneTarget: string;

  constructor(
    lsiRecord: ILsiRecord,
    username: string,
    userEmail: string,
    lsiMilestoneTarget: string,
  ) {
    super();
    this.lsiRecord = lsiRecord;
    this.username = username;
    this.userEmail = userEmail;
    this.lsiMilestoneTarget = lsiMilestoneTarget;
  }
}
