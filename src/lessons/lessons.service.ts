import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
    constructor(
        @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    ) { }

    async create(dto: CreateLessonDto) {
        const lesson = new this.lessonModel(dto);
        const saved = await lesson.save();

        // When a new lesson is added, recalculate progress for all enrollments
        // in this course so that previously-completed students get their status updated
        await this.recalcProgressForCourse(saved.sectionId?.toString());

        return saved;
    }

    /**
     * After a new lesson is added, find all enrollments whose course contains
     * this section and recompute their progressPercent from live lesson counts.
     * If a previously-100% enrollment now drops below 100%, reopen it.
     */
    private async recalcProgressForCourse(sectionId?: string) {
        if (!sectionId) return;
        try {
            const db = this.lessonModel.db;
            const require = (m: string) => eval(`require('${m}')`);
            const { Types } = require('mongoose');
            const sectionObjId = new Types.ObjectId(sectionId);

            // Find the section to get courseId
            const section = await db.collection('sections').findOne({ _id: sectionObjId });
            if (!section?.courseId) return;

            const courseObjId = section.courseId;

            // Get all sections for this course
            const sections = await db.collection('sections').find({ courseId: courseObjId }).toArray();
            const sectionIds = sections.map((s: any) => s._id);
            if (sectionIds.length === 0) return;

            // Total lessons in the course now
            const totalLessons = await db.collection('lessons').countDocuments({
                sectionId: { $in: sectionIds },
            });
            if (totalLessons === 0) return;

            // Find all enrollments for this course (active or completed)
            const enrollments = await db.collection('enrollments').find({
                courseId: courseObjId,
                status: { $in: ['active', 'completed'] },
            }).toArray();

            for (const enrollment of enrollments) {
                const enrollmentId = enrollment._id;

                // Count how many lessons this student has completed
                const completedCount = await db.collection('lessonprogresses').countDocuments({
                    enrollmentId,
                    $or: [{ status: 'completed' }, { isCompleted: true }],
                });

                const percentage = Math.round((completedCount / totalLessons) * 100);

                const updateFields: any = {
                    progressPercent: percentage,
                    lessonsCompleted: completedCount,
                };

                // If was completed but new lessons bring it below 100% → reopen
                if (enrollment.status === 'completed' && percentage < 100) {
                    updateFields.status = 'active';
                    updateFields.completedAt = null;
                }

                await db.collection('enrollments').updateOne(
                    { _id: enrollmentId },
                    { $set: updateFields },
                );
            }
        } catch {
            // Non-critical — progress will self-correct on next student interaction
        }
    }

    async findAll(sectionIds?: string[]) {
        const query = sectionIds?.length ? { sectionId: { $in: sectionIds } } : {};
        return this.lessonModel
            .find(query)
            .populate('sectionId')
            .sort({ order: 1 })
            .exec();
    }

    async findBySection(sectionId: string) {
        return this.lessonModel
            .find({ sectionId })
            .sort({ order: 1 })
            .exec();
    }

    async findOne(id: string) {
        const lesson = await this.lessonModel.findById(id);
        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${id} not found`);
        }
        return lesson;
    }

    async update(id: string, dto: UpdateLessonDto) {
        const lesson = await this.lessonModel.findByIdAndUpdate(id, dto, {
            new: true,
        });
        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${id} not found`);
        }
        return lesson;
    }

    async remove(id: string) {
        const lesson = await this.lessonModel.findByIdAndDelete(id);
        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${id} not found`);
        }
        return { message: 'Lesson deleted successfully' };
    }

    async reorder(sectionId: string, lessonIds: string[]) {
        const updates = lessonIds.map((id, index) =>
            this.lessonModel.findByIdAndUpdate(id, { order: index }),
        );
        await Promise.all(updates);
        return { message: 'Lessons reordered successfully' };
    }
}
