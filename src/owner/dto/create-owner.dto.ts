import { ApiProperty } from '@nestjs/swagger';
import {IsEmail,IsNotEmpty,IsString,IsMobilePhone,MinLength,MaxLength,} from 'class-validator';

export class CreateOwnerDto {
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
  @IsMobilePhone('en-IN', { strictMode: false }, { message: 'Invalid Indian mobile number' })
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;
}
