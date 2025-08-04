import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountsDocument = Accounts & Document;

@Schema({
  timestamps: true,
  collection: 'accounts',
})
export class Accounts {
  @Prop({ default: false })
  deleted: boolean;

  @Prop({ required: true, unique: true })
  publicId: string;

  @Prop({ required: true })
  reference: string;

  @Prop({ required: true, enum: ['bank', 'mobile_money', 'crypto', 'card'] })
  type: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ default: 'mystash' })
  processor: string;

  @Prop({ enum: ['individual', 'business'] })
  beneficiaryType: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  accountName: string;

  @Prop()
  bankName: string;

  @Prop()
  bankCode: string;

  @Prop({ type: Object })
  data: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const AccountsSchema = SchemaFactory.createForClass(Accounts);
