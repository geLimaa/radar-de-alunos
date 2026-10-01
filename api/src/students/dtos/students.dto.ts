import { Type } from "class-transformer";
import { IsOptional, IsInt, Max, Min } from "class-validator";

export class StudentQueryDTO {

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  clusterId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;
}