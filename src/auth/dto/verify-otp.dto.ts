import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  @IsMobilePhone('en-IN')
  mobile: string;

  @ApiProperty()
  @IsString()
  @Length(4, 6)
  otp: string;
}
