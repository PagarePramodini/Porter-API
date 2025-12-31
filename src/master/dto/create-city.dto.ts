import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string; // Mumbai, Pune, Delhi

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}