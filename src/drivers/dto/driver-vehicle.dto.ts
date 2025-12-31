import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class DriverVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsNotEmpty()
  vehicleMake: string;

  @ApiProperty({ example: 'Fortuner' })
  @IsNotEmpty()
  vehicleModel: string;

  @ApiProperty({ example: 'SUV' })
  @IsNotEmpty()
  vehicleType: string;

  @ApiProperty({ example: 'MH12AB1234' })
  @IsNotEmpty()
  vehicleNumber: string;

  @ApiProperty({ example: 'CHASIS123456789' })
  @IsNotEmpty()
  chassisNumber: string;
}
