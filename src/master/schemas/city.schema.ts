import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CityDocument = City & Document;

@Schema({ timestamps: true })
export class City {
  @Prop({ required: true, unique: true })
  name: string; // Mumbai, Pune

  @Prop({ default: true })
  isActive: boolean; // SOFT DELETE
}

export const CitySchema = SchemaFactory.createForClass(City);
