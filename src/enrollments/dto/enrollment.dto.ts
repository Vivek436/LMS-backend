import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsInt,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EnrollmentStatus, PaymentStatus } from "../entities/enrollment.entity";
import { IsMongoId } from "class-validator";

export class CreateEnrollmentDto {
  @ApiProperty({ description: "Student UUID" })
  @IsNotEmpty()
  @IsMongoId()
  studentId: string;

  @ApiProperty({ description: "Course UUID" })
  @IsNotEmpty()
  @IsMongoId()
  courseId: string;

  @ApiPropertyOptional({ example: 999.0, description: "Amount paid" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: "TXN123456789" })
  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class UpdateProgressDto {
  @ApiProperty({ example: 75, description: "Progress percentage (0-100)" })
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent: number;

  @ApiPropertyOptional({
    example: 18,
    description: "Number of lessons completed",
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  lessonsCompleted?: number;
}

export class SubmitReviewDto {
  @ApiProperty({ example: 5, description: "Rating (1-5)" })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    example: "Bahut acha course tha! Sab kuch clearly explain kiya gaya.",
  })
  @IsOptional()
  @IsString()
  review?: string;
}

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ example: "TXN123456789" })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ example: 999.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;
}

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ enum: EnrollmentStatus })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: 999.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @ApiPropertyOptional({ example: "TXN123456789" })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ example: 75, description: "Progress percentage (0-100)" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @ApiPropertyOptional({ example: 18, description: "Number of lessons completed" })
  @IsOptional()
  @IsInt()
  @Min(0)
  lessonsCompleted?: number;
}
