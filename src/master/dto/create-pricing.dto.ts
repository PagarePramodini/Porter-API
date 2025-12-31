import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreatePricingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  baseFare: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  perKmRate: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  commissionPercent: number;
}
