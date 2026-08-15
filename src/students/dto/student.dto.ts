import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsDateString,
} from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { StudentStatus } from "../entities/student.entity";

export class CreateStudentDto {
  @ApiProperty({ example: "Priya", description: "First name" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: "Verma", description: "Last name" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: "priya@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: "+91 9876543210" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "https://example.com/photo.jpg" })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ example: "2000-05-15" })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: "42 MG Road" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: "Mumbai" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "Maharashtra" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: "India" })
  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}

export class GetStudentsQueryDto {
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

  @ApiPropertyOptional({ example: "priya" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
