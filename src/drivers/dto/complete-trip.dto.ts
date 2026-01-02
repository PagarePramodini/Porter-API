import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CompleteTripDto {
  @ApiProperty({
    example: '695624d5431e3264196b2870',
    description: 'Booking ID for the trip to complete',
  })
  @IsMongoId()
  bookingId: string;
}