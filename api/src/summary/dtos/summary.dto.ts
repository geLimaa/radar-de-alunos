import { Type } from "class-transformer";
import { IsOptional, IsInt, Min } from "class-validator";

export class SummaryQueryDTO {

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  clusterId?: number;

}