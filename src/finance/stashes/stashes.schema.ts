import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StashesDocument = Stashes & Document;

@Schema({
  timestamps: true,
  collection: 'stashes',
})

export class Stashes {
  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: Types.ObjectId, required: true })
  interest: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  auth: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  profile: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['regular', 'salary'] })
  saveType: string;

  @Prop({ required: true, enum: ['NGN', 'USD', 'EUR', 'GBP'] })
  currency: string;

  @Prop({ default: 0 })
  target: number;

  @Prop({ default: 0 })
  currentInterest: number;

  @Prop({
    type: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      _id: { type: Types.ObjectId, auto: true },
    },
    required: true,
  })
  duration: {
    startDate: Date;
    endDate: Date;
    _id: Types.ObjectId;
  };

  @Prop({
    type: {
      autoType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true,
      },
      index: { type: Number, default: 0 },
      byPercentage: { type: Boolean, default: false },
      amount: { type: Number, required: true },
      _id: { type: Types.ObjectId, auto: true },
    },
    required: true,
  })
  automation: {
    autoType: string;
    index: number;
    byPercentage: boolean;
    amount: number;
    _id: Types.ObjectId;
  };

  @Prop({ required: true, enum: ['strict', 'flex'] })
  strictStatus: string;

  @Prop({ required: true })
  startSaveOn: Date;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ type: [String], default: [] })
  fundingSources: string[];

  @Prop({ required: true, enum: ['mystash', 'external'] })
  processor: string;

  @Prop({
    type: {
      publicId: { type: String, required: true },
      startDay: { type: Number, required: true },
      endDay: { type: Number, required: true },
      currency: {
        type: String,
        enum: ['NGN', 'USD', 'EUR', 'GBP'],
        required: true,
      },
      percentage: { type: Number, required: true },
      note: { type: String, default: '' },
    },
    required: true,
  })
  interestData: {
    publicId: string;
    startDay: number;
    endDay: number;
    currency: string;
    percentage: number;
    note: string;
  };

  @Prop({ required: true, unique: true })
  publicId: string;
}

export const StashesSchema = SchemaFactory.createForClass(Stashes);

// Add indexes for better query performance...
// Note: publicId index is automatically created due to unique: true
StashesSchema.index({ auth: 1 });
StashesSchema.index({ profile: 1 });
StashesSchema.index({ deleted: 1 });
StashesSchema.index({ saveType: 1 });
StashesSchema.index({ createdAt: -1 });
