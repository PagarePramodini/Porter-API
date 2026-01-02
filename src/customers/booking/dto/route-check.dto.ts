import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RouteCheckDto {
  @ApiProperty()
  @IsNumber()
  pickupLat: number;

  @ApiProperty()
  @IsNumber()
  pickupLng: number;

  @ApiProperty()
  @IsNumber()
  dropLat: number;

  @ApiProperty()
  @IsNumber()
  dropLng: number;
}
