import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true })
export class Wallet {
    @Prop({ required: true })
    driverId: string;

    @Prop({ default: 0 })
    balance: number;

    @Prop({ default: null })
    bankName: string;

    @Prop({ default: null })
    bankAccountNumber: string;

    @Prop({ default: null })
    ifscCode: string;

    @Prop({ default: null })
    aadharLinked: boolean; // we can simulate this validation
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

