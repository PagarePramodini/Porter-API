import { ApiProperty } from "@nestjs/swagger";

export class UpdateDriverStatusDto {

  @ApiProperty()
  isOnline: boolean;
}