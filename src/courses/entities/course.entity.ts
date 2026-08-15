import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true, collection: 'courses' })
export class Course extends Document {
  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  thumbnail: string;

  @Prop({ type: String, enum: CourseLevel, default: CourseLevel.BEGINNER })
  level: CourseLevel;

  @Prop({ type: String, enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;

  @Prop()
  category: string; // e.g. "Programming", "Design", "Business"

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: Number, default: 0 })
  durationHours: number; // Total hours

  @Prop({ type: Number, default: 0 })
  totalLessons: number;

  @Prop()
  language: string; // e.g. "Hindi", "English"

  @Prop()
  prerequisites: string; // JSON string ya plain text

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  enrollmentCount: number;

  // Foreign key - Instructor (stored as Student._id since instructors are in Student collection)
  @Prop({ type: Types.ObjectId, ref: 'Student' })
  instructorId: Types.ObjectId;

  // Virtual field for easier frontend usage
  get isPublished(): boolean {
    return this.status === CourseStatus.PUBLISHED;
  }

  // Timestamps automatically added by { timestamps: true }
  createdAt: Date;
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
