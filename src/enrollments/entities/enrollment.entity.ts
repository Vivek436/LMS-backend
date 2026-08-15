import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  SUSPENDED = 'suspended',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

@Schema({ timestamps: true, collection: 'enrollments' })
export class Enrollment extends Document {
  // Foreign keys
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: String, enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ type: Number, default: 0 })
  amountPaid: number;

  @Prop({ type: Date })
  paymentDate: Date;

  @Prop()
  paymentReference: string; // Transaction ID

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  progressPercent: number; // 0-100

  @Prop({ type: Number, default: 0 })
  lessonsCompleted: number;

  @Prop({ type: Date })
  completedAt: Date;

  @Prop({ type: Date })
  droppedAt: Date;

  @Prop({ type: Number, min: 1, max: 5 })
  rating: number; // 1-5 (student ne course ko rate kiya)

  @Prop()
  review: string;

  @Prop()
  certificateUrl: string;

  @Prop({ type: Date, default: Date.now })
  enrolledAt: Date;

  // Timestamps automatically added by { timestamps: true }
  createdAt: Date;
  updatedAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Compound unique index - ek student ek course mein ek baar enroll ho sakta hai
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
