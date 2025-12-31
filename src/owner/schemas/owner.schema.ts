import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OwnerDocument = Owner & Document;

@Schema({ timestamps: true })
export class Owner {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  // mobile is stored as string, validated in DTO
  @Prop({ required: true })
  mobile: string;

  @Prop({required: true, unique: true }) // unique index on email
  email: string;

  // password included here assuming registration includes it.
  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Driver' }], default: [] })
  drivers: Types.ObjectId[];
}

export const OwnerSchema = SchemaFactory.createForClass(Owner);

