import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifySessionDto {
  @ApiProperty()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty()
  @IsNotEmpty()
  otp: string;
}
