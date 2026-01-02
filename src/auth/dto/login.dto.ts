import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsMobilePhone('en-IN')
  mobile: string;

  @ApiProperty()
  @IsString()
  password: string;
}
