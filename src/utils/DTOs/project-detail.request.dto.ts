import { IsMongoId, IsOptional, IsString } from "class-validator";
import { BaseDto } from "./base.dto.js";

export interface IProjectDetailRequestBody {
  projectDetailId: string;
  projectName: string;
}

export class ProjectDetailRequestDto extends BaseDto {
  @IsOptional()
  @IsString()
  @IsMongoId()
  projectDetailId!: string;

  @IsOptional()
  @IsString()
  projectName!: string;

  constructor(input: IProjectDetailRequestBody) {
    super();
    if (input) {
      this.projectDetailId = input.projectDetailId;
      this.projectName = input.projectName;
    }
  }
}
