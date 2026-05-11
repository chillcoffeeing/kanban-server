import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsObject, IsOptional } from "class-validator";
import { UserProfileJson } from "../interfaces/settings-json.types";

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  profile?: UserProfileJson;
}
