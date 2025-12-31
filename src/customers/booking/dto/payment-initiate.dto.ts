import { ApiProperty } from '@nestjs/swagger';

export class PaymentInitiateDto {
  @ApiProperty({
    example: 'INR',
    description: 'Currency code',
  })
  currency: string;
}
