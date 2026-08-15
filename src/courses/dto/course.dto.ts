import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  IsUUID,
  IsInt,
} from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { CourseLevel, CourseStatus } from "../entities/course.entity";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";
export class CreateCourseDto {
  @ApiProperty({
    example: "Complete React Course 2024",
    description: "Course title",
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example:
      "React ka full course - hooks, state management, routing sab kuch.",
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: "https://example.com/thumbnail.jpg" })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({ enum: CourseLevel, default: CourseLevel.BEGINNER })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ example: "Programming" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 999.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationHours?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalLessons?: number;

  @ApiPropertyOptional({ example: "Hindi" })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: "Basic HTML/CSS knowledge required" })
  @IsOptional()
  @IsString()
  prerequisites?: string;

  @ApiPropertyOptional({ description: "Instructor UUID" })
  @IsOptional()
  // @IsUUID()
  @ApiPropertyOptional({ description: "Instructor ObjectId" })
  @IsOptional()
  @IsMongoId()
  instructorId?: string;

  @ApiPropertyOptional({ enum: CourseStatus, default: CourseStatus.DRAFT })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiPropertyOptional({ enum: CourseStatus })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}

export class PublishCourseDto {
  @ApiProperty({ enum: CourseStatus })
  @IsEnum(CourseStatus)
  status: CourseStatus;
}

export class GetCoursesQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: "react" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by instructor ID' })
  @IsOptional()
  @IsString()
  instructorId?: string;

  @ApiPropertyOptional({ enum: CourseLevel })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ enum: CourseStatus })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
