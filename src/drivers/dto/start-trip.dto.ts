import { ApiProperty } from '@nestjs/swagger';

export class StartTripDto {
  @ApiProperty({
    example: '6958e6b971572033a7be6f5d',
    description: 'Booking ID to start trip',
  })
  bookingId: string;
}