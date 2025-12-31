import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

export class SendOtpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone('en-IN')
  mobile: string;

}
