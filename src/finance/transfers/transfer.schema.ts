import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransfersDocument = Transfers & Document;

// Subdocument schemas for nested objects
@Schema({ _id: false })
export class BeneficiaryMobile {
  @Prop()
  phoneNumber: string;

  @Prop()
  isoCode: string;
}

@Schema({ _id: false })
export class Beneficiary {
  @Prop()
  type: string;

  @Prop()
  companyName: string;

  @Prop()
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  address: string;

  @Prop({ type: BeneficiaryMobile })
  mobile: BeneficiaryMobile;
}

@Schema({ _id: false })
export class BankAccount {
  @Prop()
  accountNumber: string;

  @Prop()
  sortCode: string;

  @Prop()
  swiftCode: string;
}

@Schema({
  timestamps: true,
  collection: 'transfers',
})
export class Transfers {
  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: Types.ObjectId, required: true })
  auth: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  profile: Types.ObjectId;

  @Prop({ required: true })
  sourceCurrency: string;

  @Prop()
  fundingSource: string;

  @Prop({ required: true })
  destinationCurrency: string;

  @Prop({ required: true })
  sourceAmount: number;

  @Prop()
  convertedAmount: number;

  @Prop()
  country: string;

  @Prop()
  paymentMethod: string;

  @Prop({ type: Beneficiary })
  beneficiary: Beneficiary;

  @Prop({ type: BankAccount })
  account: BankAccount;

  @Prop({ required: true })
  rate: number;

  @Prop()
  narration: string;

  @Prop()
  currencyPair: string;

  @Prop({
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
  })
  status: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ required: true, unique: true })
  publicId: string;

  createdAt: Date;
  updatedAt: Date;
}

export const TransfersSchema = SchemaFactory.createForClass(Transfers);
