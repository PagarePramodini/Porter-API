import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentPreviewDto {
  @ApiProperty({
    example: true,
    description: 'Whether loading/unloading service is required',
  })
  @IsBoolean()
  loadingUnloading: boolean;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Number of labourers (max 3)',
  })
  @IsOptional()
  @IsNumber()
  labourCount?: number;

  @ApiProperty({
    example: 'FIRST50',
    required: false,
    description: 'Optional coupon code',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
