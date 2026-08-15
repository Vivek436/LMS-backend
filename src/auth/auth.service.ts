import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Student } from '../students/entities/student.entity';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<Student>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        // Check if user exists
        const existingUser = await this.studentModel.findOne({ email: registerDto.email });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create user
        // If role is provided AND it's admin creating (no way to verify here, so we lock it)
        // Public registration ALWAYS gets student role (enforced)
        // Admin-created accounts use the provided role via a separate admin endpoint
        const user = new this.studentModel({
            ...registerDto,
            password: hashedPassword,
            role: 'student', // Public signup always creates student - never allow role override
            status: 'active',
        });

        await user.save();

        // Generate token
        const token = this.generateToken(user);

        return {
            user: this.sanitizeUser(user),
            token,
        };
    }

    // Admin-only: create instructor account with login credentials
    async createInstructorAccount(dto: RegisterDto) {
        const existingUser = await this.studentModel.findOne({ email: dto.email });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = new this.studentModel({
            ...dto,
            password: hashedPassword,
            role: 'instructor', // Force instructor role
            status: 'active',
        });

        await user.save();

        return {
            user: this.sanitizeUser(user),
            message: 'Instructor account created. Share the credentials with the instructor.',
        };
    }

    async login(loginDto: LoginDto) {

        // Find user with password
        const user = await this.studentModel.findOne({ email: loginDto.email }).select('+password');

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }


        // Check password
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        // Generate token
        const token = this.generateToken(user);

        return {
            user: this.sanitizeUser(user),
            token,
        };
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        const user = await this.studentModel.findById(userId).select('+password');

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify old password
        const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new UnauthorizedException('Old password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return { message: 'Password changed successfully' };
    }

    async getProfile(userId: string) {
        const user = await this.studentModel.findById(userId);
        return this.sanitizeUser(user);
    }

    private generateToken(user: any) {
        const payload = { id: user._id, email: user.email, role: user.role };
        return this.jwtService.sign(payload);
    }

    private sanitizeUser(user: any) {
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
    }
}
