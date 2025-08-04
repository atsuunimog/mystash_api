import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OldUserStatisticsDocument = OldUserStatistics & Document;

@Schema({
  timestamps: true,
  collection: 'userstatistics',
})
export class OldUserStatistics {
  @Prop({ required: true, unique: true })
  uid: string;

  @Prop({ default: 0 })
  referredMandatesActivated: number;

  @Prop({ default: 0 })
  referredMandatesCreated: number;

  @Prop({ default: 0 })
  referrals: number;

  @Prop({ default: 0 })
  withdrawals: number;

  @Prop({ default: 0 })
  cashReserveStashes: number;

  @Prop({ default: 0 })
  stashes: number;

  @Prop({ default: 0 })
  mandateBreaks: number;

  @Prop({ default: 0 })
  mandates: number;

  @Prop({ default: 0 })
  activeMandates: number;

  @Prop({ default: 0 })
  linkedCards: number;

  @Prop({ default: 0 })
  linkedAccounts: number;

  createdAt: Date;
  updatedAt: Date;
}

export const OldUserStatisticsSchema =
  SchemaFactory.createForClass(OldUserStatistics);
