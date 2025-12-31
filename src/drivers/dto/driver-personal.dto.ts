import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMobilePhone, MinLength } from 'class-validator';

export class DriverPersonalDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMobilePhone("en-IN")
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMobilePhone("en-IN")
  emergencyMobile: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
