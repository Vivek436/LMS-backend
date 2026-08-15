import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum InstructorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true, collection: 'instructors' })
export class Instructor extends Document {
  @Prop({ required: true, maxlength: 100 })
  firstName: string;

  @Prop({ required: true, maxlength: 100 })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  bio: string;

  @Prop()
  qualification: string; // e.g. "PhD Computer Science"

  @Prop()
  specialization: string; // e.g. "Web Development, AI"

  @Prop()
  profileImage: string;

  @Prop({ type: String, enum: InstructorStatus, default: InstructorStatus.ACTIVE })
  status: InstructorStatus;

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating: number; // 0.00 to 5.00

  // Timestamps automatically added by { timestamps: true }
  createdAt: Date;
  updatedAt: Date;
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);
