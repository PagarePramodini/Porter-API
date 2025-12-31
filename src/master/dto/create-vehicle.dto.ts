import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string; // Bike | Tempo | Truck

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string; // Mumbai

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
