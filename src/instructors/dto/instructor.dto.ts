import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { InstructorStatus } from '../entities/instructor.entity';

export class CreateInstructorDto {
  @ApiProperty({ example: 'Rahul', description: 'First name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Sharma', description: 'Last name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'rahul@example.com', description: 'Email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+91 9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Expert in web development with 10 years experience.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'PhD Computer Science' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional({ example: 'Web Development, ReactJS' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class UpdateInstructorDto extends PartialType(CreateInstructorDto) {
  @ApiPropertyOptional({ enum: InstructorStatus })
  @IsOptional()
  @IsEnum(InstructorStatus)
  status?: InstructorStatus;

  @ApiPropertyOptional({ example: 4.5, minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}
