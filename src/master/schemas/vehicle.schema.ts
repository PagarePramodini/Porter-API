import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true, unique: true })
  name: string; // Bike | Tempo | Truck

  @Prop()
  maxLoadKg: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

VehicleSchema.index({ name: 1, city: 1 }, { unique: true });