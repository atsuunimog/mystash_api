import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

// Mobile subdocument schema
@Schema({ _id: false })
export class Mobile {
  @Prop({ default: '' })
  phoneNumber: string;

  @Prop({ default: 'NG' })
  isoCode: string;
}

// Verifications subdocument schema
@Schema({ _id: false })
export class Verifications {
  @Prop({ default: false })
  email: boolean;

  @Prop({ default: false })
  mobile: boolean;
}

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({ type: Types.ObjectId, required: true })
  auth: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  profile: Types.ObjectId;

  @Prop({ required: true, unique: true })
  uniqueId: string;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: Mobile, default: () => ({}) })
  mobile: Mobile;

  @Prop({ required: true, unique: true })
  publicId: string;

  @Prop({ type: Verifications, default: () => ({}) })
  verifications: Verifications;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
