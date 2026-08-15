import { IsNotEmpty, IsMongoId, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LessonProgressStatus {
    NOT_STARTED = 'not-started',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
}

export class CreateLessonProgressDto {
    @ApiProperty({ description: 'Student MongoDB ID' })
    @IsNotEmpty()
    @IsMongoId()
    studentId: string;

    @ApiProperty({ description: 'Lesson MongoDB ID' })
    @IsNotEmpty()
    @IsMongoId()
    lessonId: string;

    @ApiProperty({ description: 'Enrollment MongoDB ID' })
    @IsNotEmpty()
    @IsMongoId()
    enrollmentId: string;

    @ApiPropertyOptional({ enum: LessonProgressStatus, default: LessonProgressStatus.IN_PROGRESS })
    @IsOptional()
    @IsEnum(LessonProgressStatus)
    status?: LessonProgressStatus;
}

export class UpdateLessonProgressDto {
    @ApiPropertyOptional({ enum: LessonProgressStatus })
    @IsOptional()
    @IsEnum(LessonProgressStatus)
    status?: LessonProgressStatus;

    @ApiPropertyOptional({ example: '2026-04-20T12:00:00Z' })
    @IsOptional()
    @IsDateString()
    completedAt?: string;
}
