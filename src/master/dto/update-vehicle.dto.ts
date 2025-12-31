import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
