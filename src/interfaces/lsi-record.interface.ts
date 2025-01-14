import { socialPlatformNames } from "../utils/DTOs/create-lsi-request.dto.js";

export interface ILsiRecord {
  lsi: string;
  s_p_n: socialPlatformNames;
  gen_date: Date;
  count: number;
}
