import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleType: string; // Bike | Tempo | Truck

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
