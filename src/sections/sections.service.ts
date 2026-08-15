import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section } from './entities/section.entity';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class SectionsService {
    constructor(
        @InjectModel(Section.name) private sectionModel: Model<Section>,
        @InjectModel(Course.name) private courseModel: Model<Course>,
    ) { }

    async create(dto: CreateSectionDto) {
        const section = new this.sectionModel(dto);
        return section.save();
    }

    async findAll(filters?: { instructorId?: string; courseId?: string }) {
        let matchCourseIds: string[] | undefined;

        // If instructorId provided, get only their course IDs first
        if (filters?.instructorId) {
            const courses = await this.courseModel
                .find({ instructorId: filters.instructorId }) // compare as string
                .select('_id')
                .exec();
            matchCourseIds = courses.map(c => c._id.toString());
        }

        const query: any = {};

        if (matchCourseIds !== undefined) {
            // courseId in sections is stored as string
            query.courseId = { $in: matchCourseIds };
        }

        if (filters?.courseId) {
            query.courseId = filters.courseId; // string comparison
        }

        return this.sectionModel
            .find(query)
            .populate('courseId')
            .sort({ order: 1 })
            .exec();
    }

    async findByCourse(courseId: string) {
        return this.sectionModel
            .find({ courseId })
            .sort({ order: 1 })
            .exec();
    }

    async findOne(id: string) {
        const section = await this.sectionModel.findById(id);
        if (!section) {
            throw new NotFoundException(`Section with ID ${id} not found`);
        }
        return section;
    }

    async update(id: string, dto: UpdateSectionDto) {
        const section = await this.sectionModel.findByIdAndUpdate(id, dto, {
            new: true,
        });
        if (!section) {
            throw new NotFoundException(`Section with ID ${id} not found`);
        }
        return section;
    }

    async remove(id: string) {
        const section = await this.sectionModel.findByIdAndDelete(id);
        if (!section) {
            throw new NotFoundException(`Section with ID ${id} not found`);
        }
        return { message: 'Section deleted successfully' };
    }

    async reorder(courseId: string, sectionIds: string[]) {
        const updates = sectionIds.map((id, index) =>
            this.sectionModel.findByIdAndUpdate(id, { order: index }),
        );
        await Promise.all(updates);
        return { message: 'Sections reordered successfully' };
    }
}
