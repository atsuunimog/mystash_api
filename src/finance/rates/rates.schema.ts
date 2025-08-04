import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RatesDocument = Rates & Document; // Document type for Mongoose

@Schema({
  timestamps: true,
  collection: 'rates',
}) // Subdocument schemas for nested objects...
export class Rates {
  @Prop({ default: false })
  deleted: boolean;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  sourceCurrency: string;

  @Prop({ required: true })
  destinationCurrency: string;

  @Prop({ required: true, default: 'mystash' })
  source: string;

  @Prop({ required: true, default: 0 })
  minAmount: number;

  @Prop({ default: 0 })
  fee: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ required: true, unique: true })
  publicId: string;
}

export const RatesSchema = SchemaFactory.createForClass(Rates);
