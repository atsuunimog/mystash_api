import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type InterestsDocument = Interests & Document; // Document type for Mongoose

@Schema({
  timestamps: true,
  collection: 'interests',
}) // Subdocument schemas for nested objects...
export class Interests {
  @Prop({ default: false })
  deleted: boolean;

  @Prop({ required: true, type: Types.ObjectId })
  auth: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  profile: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  startDay: number;

  @Prop({ required: true })
  endDay: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  percentage: number;

  @Prop({ default: '' })
  note: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ required: true, unique: true })
  publicId: string;
}

export const InterestsSchema = SchemaFactory.createForClass(Interests);
