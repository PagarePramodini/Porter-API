import { IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdatePricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseFare?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perKmRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionPercent?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
