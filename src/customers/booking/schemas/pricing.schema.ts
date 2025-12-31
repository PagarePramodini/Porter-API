import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PricingDocument = Pricing & Document;

@Schema({ timestamps: true })
export class Pricing {
  @Prop({ required: true })
  city: string; // e.g. Mumbai

  @Prop({ required: true })
  vehicleType: string; // Bike | Tempo | Truck

  @Prop({ required: true })
  baseFare: number;

  @Prop({ required: true })
  perKmRate: number;

  @Prop({ required: true })
  commissionPercent: number; // 0.2 = 20%

  @Prop({ default: true })
  isActive: boolean;
}

export const PricingSchema = SchemaFactory.createForClass(Pricing);

PricingSchema.index(
  { city: 1, vehicleType: 1 },
  { unique: true }
);