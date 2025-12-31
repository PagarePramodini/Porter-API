import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true, unique: true })
    mobile: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, default: false })
    acceptedTerms: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
