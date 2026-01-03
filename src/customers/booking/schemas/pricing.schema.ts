import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PricingDocument = Pricing & Document;

@Schema({ timestamps: true })
export class Pricing {
  @Prop({ required: true })
  vehicleType: string; // Bike | Tempo | Truck

  @Prop({ required: true })
  baseFare: number;

  @Prop({ required: true })
  perKmRate: number;

  @Prop()
  commissionPercent: number; // 0.2 = 20%

  @Prop({ default: true })
  isActive: boolean;
}

export const PricingSchema = SchemaFactory.createForClass(Pricing);
