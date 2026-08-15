import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true, collection: 'students' })
export class Student extends Document {
  @Prop({ required: true, maxlength: 100 })
  firstName: string;

  @Prop({ required: true, maxlength: 100 })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'student', enum: ['admin', 'instructor', 'student'] })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  phone: string;

  @Prop()
  profileImage: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop({ default: 'India' })
  country: string;

  @Prop({ type: String, enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Prop({ type: Number, default: 0 })
  totalCoursesEnrolled: number;

  @Prop({ type: Number, default: 0 })
  totalCoursesCompleted: number;

  // Timestamps automatically added by { timestamps: true }
  createdAt: Date;
  updatedAt: Date;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
