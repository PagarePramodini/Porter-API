import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ enum: ['customer','driver'] })
  @IsNotEmpty()
  @IsIn(['customer','driver'])
  userType: 'customer' | 'driver';

  // payload is free-form object (your existing DTO shape)
  @ApiProperty({ description: 'Full registration payload (object)' })
  @IsNotEmpty()
  payload: any;
}
