import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from '../students/entities/student.entity';
import { Instructor } from '../instructors/entities/instructor.entity';
import { UpdateUserDto } from './dto/update-user.dto';
// import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<Student>,
        @InjectModel(Instructor.name) private instructorModel: Model<Instructor>,
    ) { }

    async findById(id: string): Promise<any> {
        // Try to find in students first
        const student = await this.studentModel.findById(id).exec();
        if (student) {
            return { ...student.toObject(), role: 'student' };
        }

        // Try to find in instructors
        const instructor = await this.instructorModel.findById(id).exec();
        if (instructor) {
            return { ...instructor.toObject(), role: 'instructor' };
        }

        throw new NotFoundException('User not found');
    }

    async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<any> {
        // Try to update in students first
        const student = await this.studentModel.findByIdAndUpdate(
            id,
            { $set: updateUserDto },
            { new: true, runValidators: true }
        ).select('-password').exec();

        if (student) {
            return { ...student.toObject(), role: 'student' };
        }

        // Try to update in instructors
        const instructor = await this.instructorModel.findByIdAndUpdate(
            id,
            { $set: updateUserDto },
            { new: true, runValidators: true }
        ).exec();

        if (instructor) {
            return { ...instructor.toObject(), role: 'instructor' };
        }

        throw new NotFoundException('User not found');
    }

    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;

        // Find user first
        const user = await this.findById(id);
        let userDoc: any;

        if (user.role === 'student') {
            userDoc = await this.studentModel.findById(id).select('+password').exec();
        } else {
            userDoc = await this.instructorModel.findById(id).select('+password').exec();
        }

        if (!userDoc) {
            throw new NotFoundException('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userDoc.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        if (user.role === 'student') {
            await this.studentModel.findByIdAndUpdate(id, { password: hashedNewPassword }).exec();
        } else {
            await this.instructorModel.findByIdAndUpdate(id, { password: hashedNewPassword }).exec();
        }
    }

    async getUserStats(id: string): Promise<any> {
        const user = await this.findById(id);
        const stats: any = {};

        if (user.role === 'student') {
            // Get student stats
            stats.totalEnrollments = 0;
            stats.activeCourses = 0;
            stats.completedCourses = 0;
        } else if (user.role === 'instructor') {
            // Get instructor stats
            stats.totalCourses = 0;
            stats.activeCourses = 0;
            stats.totalStudents = 0;
        } else if (user.role === 'admin') {
            // Get admin stats
            stats.totalStudents = await this.studentModel.countDocuments().exec();
            stats.totalInstructors = await this.instructorModel.countDocuments().exec();
        }

        return stats;
    }
}