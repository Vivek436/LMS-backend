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
        return lesson.save();
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
