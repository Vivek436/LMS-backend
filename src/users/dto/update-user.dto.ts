import { IsOptional, IsString, IsEmail, IsArray } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    profileImage?: string;

    // Instructor specific fields
    @IsOptional()
    @IsString()
    expertise?: string;

    @IsOptional()
    @IsString()
    experience?: string;

    @IsOptional()
    @IsString()
    qualification?: string;

    // Admin specific fields
    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsArray()
    permissions?: string[];
}