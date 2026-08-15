import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'John' })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'student', enum: ['student', 'instructor', 'admin'] })
    @IsOptional()
    @IsString()
    role?: string;
}

export class LoginDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    password: string;
}

export class ChangePasswordDto {
    @ApiProperty()
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({ minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
