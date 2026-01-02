import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class StartTripDto {
  @ApiProperty({
    example: '695624d5431e3264196b2870',
    description: 'Booking ID assigned to the driver',
  })
  @IsMongoId()
  bookingId: string;
}
