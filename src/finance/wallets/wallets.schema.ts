import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type WalletsDocument = Wallets & Document;

@Schema({
  timestamps: true,
  collection: 'wallets',
})
export class Wallets {
  @Prop({ default: false })
  deleted: boolean;

  @Prop({ required: true, unique: true })
  publicId: string;

  @Prop({ type: Types.ObjectId, required: true })
  auth: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  profile: Types.ObjectId;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({ type: Date })
  lastUpdated: Date;

  @Prop({ default: 'mystash' })
  processor: string;
}

export const WalletsSchema = SchemaFactory.createForClass(Wallets);
