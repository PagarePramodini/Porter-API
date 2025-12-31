import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateCityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
