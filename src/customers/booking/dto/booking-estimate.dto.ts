import { IsNumber } from "class-validator";

export class BookingEstimateDto {
  @IsNumber()
  pickupLat: number;

  @IsNumber()
  pickupLng: number;

  @IsNumber()
  dropLat: number;

  @IsNumber()
  dropLng: number;
}
