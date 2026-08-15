import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LessonProgress, LessonProgressStatus } from './entities/lesson-progress.entity';
import { CreateLessonProgressDto, UpdateLessonProgressDto } from './dto/lesson-progress.dto';

@Injectable()
export class LessonProgressService {
    constructor(
        @InjectModel(LessonProgress.name)
        private lessonProgressModel: Model<LessonProgress>,
    ) { }

    async create(dto: CreateLessonProgressDto) {
        const existing = await this.lessonProgressModel.findOne({
            studentId: dto.studentId,
            lessonId: dto.lessonId,
        });

        if (existing) {
            return existing;
        }

        const progress = new this.lessonProgressModel(dto);
        if (dto.status === LessonProgressStatus.COMPLETED) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
        }
        const saved = await progress.save();

        // Update enrollment progress if status is completed
        if (dto.status === LessonProgressStatus.COMPLETED) {
            await this.updateEnrollmentProgress(dto.enrollmentId);
        }

        return saved;
    }

    async findByEnrollment(enrollmentId: string) {
        const results = await this.lessonProgressModel
            .find({ enrollmentId })
            .populate('lessonId')
            .exec();
        return results;
    }

    async findByStudent(studentId: string) {
        const results = await this.lessonProgressModel
            .find({ studentId })
            .populate('lessonId')
            .exec();
        return results;
    }

    async findByStudentAndLesson(studentId: string, lessonId: string) {
        return this.lessonProgressModel.findOne({ studentId, lessonId });
    }

    async update(studentId: string, lessonId: string, dto: UpdateLessonProgressDto) {
        const progress = await this.lessonProgressModel.findOne({
            studentId,
            lessonId,
        });

        if (!progress) {
            throw new NotFoundException('Progress not found');
        }

        // Update status and set isCompleted flag
        if (dto.status === LessonProgressStatus.COMPLETED) {
            progress.isCompleted = true;
            if (!progress.completedAt) {
                progress.completedAt = dto.completedAt ? new Date(dto.completedAt) : new Date();
            }
        }

        Object.assign(progress, dto);
        return progress.save();
    }

    async updateById(id: string, dto: UpdateLessonProgressDto) {
        const progress = await this.lessonProgressModel.findById(id);

        if (!progress) {
            throw new NotFoundException('Progress not found');
        }

        // Update status and set isCompleted flag
        if (dto.status === LessonProgressStatus.COMPLETED) {
            progress.isCompleted = true;
            if (!progress.completedAt) {
                progress.completedAt = dto.completedAt ? new Date(dto.completedAt) : new Date();
            }
        }

        Object.assign(progress, dto);
        const saved = await progress.save();

        // Update enrollment progress percentage
        await this.updateEnrollmentProgress(progress.enrollmentId.toString());

        return saved;
    }

    private async updateEnrollmentProgress(enrollmentId: string) {
        try {
            const db = this.lessonProgressModel.db;
            const enrollmentObjId = new (require('mongoose').Types.ObjectId)(enrollmentId);

            // Fetch enrollment
            const enrollment = await db.collection('enrollments').findOne({ _id: enrollmentObjId });

            // Count completed lessons for this enrollment
            const allProgress = await this.lessonProgressModel.find({ enrollmentId });
            const completed = allProgress.filter((p) => p.status === LessonProgressStatus.COMPLETED || p.isCompleted).length;

            // Always use live lesson count from DB so that new lessons added by instructor
            // are immediately reflected in the progress percentage
            let total = 0;
            if (enrollment?.courseId) {
                const courseObjId = typeof enrollment.courseId === 'string'
                    ? new (require('mongoose').Types.ObjectId)(enrollment.courseId)
                    : enrollment.courseId;

                const sections = await db.collection('sections').find({ courseId: courseObjId }).toArray();
                const sectionIds = sections.map((s) => s._id);
                if (sectionIds.length > 0) {
                    total = await db.collection('lessons').countDocuments({ sectionId: { $in: sectionIds } });
                }
            }

            // Fallback only when sections/lessons are missing (shouldn't happen in practice)
            if (total === 0) {
                total = allProgress.length;
            }

            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            const updateFields: any = {
                progressPercent: percentage,
                lessonsCompleted: completed,
            };

            if (percentage === 100) {
                updateFields.status = 'completed';
                if (!enrollment?.completedAt) {
                    updateFields.completedAt = new Date();
                }
            } else if (percentage < 100 && enrollment?.status === 'completed') {
                // Instructor added new lessons — reopen the enrollment
                updateFields.status = 'active';
                updateFields.completedAt = null;
            }

            await db.collection('enrollments').updateOne(
                { _id: enrollmentObjId },
                { $set: updateFields },
            );

        } catch (error) {
            // Silent fail — progress will be corrected on next interaction
        }
    }

    async getStats(enrollmentId: string) {
        const allProgress = await this.lessonProgressModel.find({ enrollmentId });
        const completed = allProgress.filter((p) => p.status === LessonProgressStatus.COMPLETED).length;
        const total = allProgress.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            percentage,
        };
    }
}
