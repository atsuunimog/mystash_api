import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentsDocument = Payments & Document;

@Schema()
export class Currency {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  conversionRate: number;
}

@Schema()
export class MetaData {
  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  cardId: string;

  @Prop({ required: true })
  mandateId: string;

  @Prop({ required: true })
  accountId: string;

  @Prop({ required: true })
  totalTransactionAmount: number;

  @Prop({ required: true })
  currency: string;
}

@Schema({ timestamps: true })
export class Payments {
  @Prop({ type: Currency, required: true })
  currency: Currency;

  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  cardType: string;

  @Prop({ required: true })
  last4: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ type: MetaData, required: true })
  metaData: MetaData;

  @Prop({ required: true })
  reference: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  user: string;
}

export const PaymentsSchema = SchemaFactory.createForClass(Payments);
