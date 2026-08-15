import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../courses/entities/course.entity';
import { Section } from '../../sections/entities/section.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

/**
 * Guard to check resource ownership
 * Verifies if user owns the resource they're trying to access/modify
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectModel(Course.name) private courseModel: Model<Course>,
        @InjectModel(Section.name) private sectionModel: Model<Section>,
        @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
        @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Admin can access everything
        if (user.role === 'admin') {
            return true;
        }

        const resourceId = request.params.id;
        const resourceType = this.reflector.get<string>('resourceType', context.getHandler());

        if (!resourceType || !resourceId) {
            return true; // No ownership check needed
        }

        try {
            switch (resourceType) {
                case 'course':
                    return await this.checkCourseOwnership(resourceId, user);

                case 'section':
                    return await this.checkSectionOwnership(resourceId, user);

                case 'lesson':
                    return await this.checkLessonOwnership(resourceId, user);

                case 'enrollment':
                    return await this.checkEnrollmentAccess(resourceId, user);

                default:
                    return true;
            }
        } catch (error) {
            throw new ForbiddenException('You do not have permission to access this resource');
        }
    }

    private async checkCourseOwnership(courseId: string, user: any): Promise<boolean> {
        if (user.role !== 'instructor') return false;

        const course = await this.courseModel.findById(courseId);
        if (!course) return false;

        // If instructorId is null (legacy courses), deny access — instructor must claim it via admin
        if (!course.instructorId) return false;

        return course.instructorId.toString() === user._id.toString();
    }

    private async checkSectionOwnership(sectionId: string, user: any): Promise<boolean> {
        if (user.role !== 'instructor') return false;

        const section = await this.sectionModel.findById(sectionId).populate('courseId');
        if (!section || !section.courseId) return false;

        const course = section.courseId as any;
        // If instructorId is null, deny access
        if (!course.instructorId) return false;

        return course.instructorId.toString() === user._id.toString();
    }

    private async checkLessonOwnership(lessonId: string, user: any): Promise<boolean> {
        if (user.role !== 'instructor') return false;

        const lesson = await this.lessonModel.findById(lessonId).populate({
            path: 'sectionId',
            populate: { path: 'courseId' }
        });

        if (!lesson || !lesson.sectionId) return false;

        const section = lesson.sectionId as any;
        if (!section.courseId) return false;

        const course = section.courseId as any;
        // If instructorId is null, deny access
        if (!course.instructorId) return false;

        return course.instructorId.toString() === user._id.toString();
    }

    private async checkEnrollmentAccess(enrollmentId: string, user: any): Promise<boolean> {
        const enrollment = await this.enrollmentModel.findById(enrollmentId).populate('courseId');
        if (!enrollment) return false;

        // Student can access their own enrollment
        if (user.role === 'student') {
            return enrollment.studentId.toString() === user._id.toString();
        }

        // Instructor can access enrollments for their courses
        if (user.role === 'instructor' && enrollment.courseId) {
            const course = enrollment.courseId as any;
            return course.instructorId.toString() === user._id.toString();
        }

        return false;
    }
}
