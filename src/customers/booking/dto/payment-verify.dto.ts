import { ApiProperty } from '@nestjs/swagger';

export class PaymentVerifyDto {
  @ApiProperty()
  razorpayOrderId: string;

  @ApiProperty()
  razorpayPaymentId: string;

  @ApiProperty()
  razorpaySignature: string;
}
