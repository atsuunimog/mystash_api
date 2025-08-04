import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionsDocument = Transactions & Document;

@Schema({
  timestamps: true,
  collection: 'transactions',
})
export class Transactions {
  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ required: true })
  publicId: string;

  @Prop({ type: Types.ObjectId, required: true })
  auth: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  profile: Types.ObjectId;

  @Prop({ required: true, enum: ['NGN', 'USD', 'EUR', 'GBP'] })
  currency: string;

  @Prop({ required: true, enum: ['credit', 'debit'] })
  entry: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  destinationType: string;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  sourceType: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({ default: 0 })
  fee: number;

  @Prop()
  narration: string;

  @Prop({ required: true })
  reference: string;

  @Prop({ default: null })
  debitReference: string;

  @Prop({ required: true })
  tRef: string;

  @Prop({
    required: true,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Date })
  completedAt: Date;

  @Prop()
  processor: string;

  @Prop({ type: Object, default: {} })
  meta: any;

  @Prop()
  currencyPair: string;

  @Prop({ type: Object, default: {} })
  metadata: any;

  @Prop({ default: 0 })
  __v: number;

  createdAt: Date;
  updatedAt: Date;
}

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);
