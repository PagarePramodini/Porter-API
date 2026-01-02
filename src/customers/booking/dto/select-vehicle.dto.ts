import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SelectVehicleDto {
  @ApiProperty({ example: 'Bike', description: 'Selected vehicle type',})
  @IsString()
  vehicleType: string;

  @ApiProperty({ example: 19.076, description: 'Pickup latitude' })
  @IsNumber()
  pickupLat: number;

  @ApiProperty({ example: 72.8777, description: 'Pickup longitude' })
  @IsNumber()
  pickupLng: number;

  @ApiProperty({ example: 19.2183, description: 'Drop latitude' })
  @IsNumber()
  dropLat: number;

  @ApiProperty({ example: 72.9781, description: 'Drop longitude' })
  @IsNumber()
  dropLng: number;

  receiverName: string;
  
  receiverMobile: string;
}
