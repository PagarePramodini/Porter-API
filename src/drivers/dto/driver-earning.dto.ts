import { ApiProperty } from "@nestjs/swagger";

export class DriverEarningDto {
  @ApiProperty()
  driverId: string;

  @ApiProperty()
  totalEarnings: number;

  @ApiProperty()
  tripsCount: number;

  @ApiProperty()
  walletBalance: number;
}
