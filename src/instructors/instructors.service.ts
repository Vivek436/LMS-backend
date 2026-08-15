import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Instructor, InstructorStatus } from './entities/instructor.entity';
import { CreateInstructorDto, UpdateInstructorDto } from './dto/instructor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<Instructor>,
  ) { }

  // CREATE
  async create(dto: CreateInstructorDto): Promise<Instructor> {
    // Email unique check
    const existing = await this.instructorModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException(`Email '${dto.email}' already registered`);
    }

    const instructor = new this.instructorModel(dto);
    return instructor.save();
  }

  // READ ALL with pagination & search
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const [instructors, total] = await Promise.all([
      this.instructorModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.instructorModel.countDocuments(filter),
    ]);

    return {
      data: instructors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // READ ONE
  async findOne(id: string): Promise<Instructor> {
    const instructor = await this.instructorModel.findById(id).exec();
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID '${id}' not found`);
    }
    return instructor;
  }

  // UPDATE
  async update(id: string, dto: UpdateInstructorDto): Promise<Instructor> {
    const instructor = await this.findOne(id);

    // Email change pe duplicate check
    if (dto.email && dto.email !== instructor.email) {
      const emailExists = await this.instructorModel.findOne({ email: dto.email });
      if (emailExists) {
        throw new ConflictException(`Email '${dto.email}' already in use`);
      }
    }

    Object.assign(instructor, dto);
    return instructor.save();
  }

  // DELETE
  async remove(id: string): Promise<{ message: string }> {
    const instructor = await this.findOne(id);

    // Check if instructor has active courses (using Course model)
    // Note: Yeh check karne ke liye Course model inject karna padega ya separate query
    // For now, simple delete kar rahe hain

    await this.instructorModel.findByIdAndDelete(id);
    return { message: `Instructor deleted successfully` };
  }

  // SOFT DELETE - status inactive karo
  async deactivate(id: string): Promise<Instructor> {
    const instructor = await this.findOne(id);
    instructor.status = InstructorStatus.INACTIVE;
    return instructor.save();
  }
}
