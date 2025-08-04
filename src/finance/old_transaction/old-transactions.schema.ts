import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OldTransactionsDocument = OldTransactions & Document;

@Schema({
  timestamps: true,
  collection: 'old_transactions',
})
export class OldTransactions {
  @Prop({ required: true, enum: ['credit', 'debit'] })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  narration: string;

  @Prop({ type: Date })
  date: Date;

  @Prop({ required: true })
  balance: number;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  obpId: string;

  @Prop({ required: true })
  obpName: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OldTransactionsSchema =
  SchemaFactory.createForClass(OldTransactions);
