import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';

@Injectable()
export class ResourcesService {
    constructor(
        @InjectModel(Resource.name) private resourceModel: Model<Resource>,
    ) { }

    async create(dto: CreateResourceDto) {
        const resource = new this.resourceModel(dto);
        return resource.save();
    }

    async findAll() {
        return this.resourceModel.find().populate('lessonId').exec();
    }

    async findByLesson(lessonId: string) {
        return this.resourceModel.find({ lessonId }).exec();
    }

    async findOne(id: string) {
        const resource = await this.resourceModel.findById(id);
        if (!resource) {
            throw new NotFoundException(`Resource with ID ${id} not found`);
        }
        return resource;
    }

    async update(id: string, dto: UpdateResourceDto) {
        const resource = await this.resourceModel.findByIdAndUpdate(id, dto, {
            new: true,
        });
        if (!resource) {
            throw new NotFoundException(`Resource with ID ${id} not found`);
        }
        return resource;
    }

    async remove(id: string) {
        const resource = await this.resourceModel.findByIdAndDelete(id);
        if (!resource) {
            throw new NotFoundException(`Resource with ID ${id} not found`);
        }
        return { message: 'Resource deleted successfully' };
    }
}
