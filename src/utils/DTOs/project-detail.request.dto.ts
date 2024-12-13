import { IsDefined, IsMongoId, IsOptional, IsString } from "class-validator";
import { BaseDto } from "./base.dto.js";

export interface IProjectDetailRequestBody {
  projectName: string;
  projectDetailId?: string;
}

export class ProjectDetailRequestDto extends BaseDto {
  @IsDefined()
  @IsString()
  projectName!: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  projectDetailId?: string;

  constructor(input: IProjectDetailRequestBody) {
    super();
    if (input) {
      this.projectName = input.projectName;
      this.projectDetailId = input.projectDetailId;
    }
  }
}
