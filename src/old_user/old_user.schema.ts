import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OldUserDocument = OldUser & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class OldUser {
  @Prop({ required: true, unique: true })
  uid: string;

  @Prop({ default: 1 })
  onboardingStage: number;

  @Prop({ default: false })
  ambassador: boolean;

  @Prop({ type: [String], default: [] })
  personas: string[];

  @Prop({ default: false })
  suspended: boolean;

  @Prop({ default: false })
  disabled: boolean;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  password: string;

  @Prop()
  referralCode: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OldUserSchema = SchemaFactory.createForClass(OldUser);
