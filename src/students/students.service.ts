import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentStatus } from './entities/student.entity';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<Student>,
  ) { }

  // CREATE
  async create(dto: CreateStudentDto): Promise<Student> {
    const existing = await this.studentModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException(`Email '${dto.email}' already registered`);
    }

    const student = new this.studentModel(dto);
    return student.save();
  }

  // READ ALL
  async findAll(paginationDto: PaginationDto & { status?: string; city?: string; role?: string }) {
    const { page = 1, limit = 10, search, status, city, role } = paginationDto;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    // role filter: 'instructor', 'student', 'admin'
    // If no role specified, default to only students (not instructors/admins)
    if (role) {
      filter.role = role;
    } else {
      filter.role = 'student'; // default: only show students in student list
    }

    const [students, total] = await Promise.all([
      this.studentModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.studentModel.countDocuments(filter),
    ]);

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // READ ONE
  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID '${id}' not found`);
    }
    return student;
  }

  // UPDATE
  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    if (dto.email && dto.email !== student.email) {
      const emailExists = await this.studentModel.findOne({ email: dto.email });
      if (emailExists) {
        throw new ConflictException(`Email '${dto.email}' already in use`);
      }
    }

    Object.assign(student, dto);
    return student.save();
  }

  // DELETE
  async remove(id: string): Promise<{ message: string }> {
    const student = await this.findOne(id);

    if (student.totalCoursesEnrolled > 0) {
      throw new BadRequestException(
        `Cannot delete student. They are enrolled in ${student.totalCoursesEnrolled} course(s). Unenroll first or deactivate the account.`,
      );
    }

    await this.studentModel.findByIdAndDelete(id);
    return { message: 'Student deleted successfully' };
  }

  // SUSPEND student
  async suspend(id: string): Promise<Student> {
    const student = await this.findOne(id);
    student.status = StudentStatus.SUSPENDED;
    return student.save();
  }

  // ACTIVATE student
  async activate(id: string): Promise<Student> {
    const student = await this.findOne(id);
    student.status = StudentStatus.ACTIVE;
    return student.save();
  }

  // Student dashboard stats
  async getStudentStats(id: string) {
    const student = await this.studentModel
      .findById(id)
      .populate({
        path: 'enrollments',
        populate: { path: 'course' },
        options: { limit: 5, sort: { createdAt: -1 } },
      })
      .exec();

    if (!student) {
      throw new NotFoundException(`Student with ID '${id}' not found`);
    }

    return {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
      },
      stats: {
        totalEnrolled: student.totalCoursesEnrolled,
        totalCompleted: student.totalCoursesCompleted,
        inProgress: student.totalCoursesEnrolled - student.totalCoursesCompleted,
        completionRate:
          student.totalCoursesEnrolled > 0
            ? Math.round((student.totalCoursesCompleted / student.totalCoursesEnrolled) * 100)
            : 0,
      },
      recentEnrollments: [],
    };
  }

  // Internal method: enrollment count update karo
  async incrementEnrollment(id: string): Promise<void> {
    await this.studentModel.findByIdAndUpdate(id, { $inc: { totalCoursesEnrolled: 1 } });
  }

  async decrementEnrollment(id: string): Promise<void> {
    await this.studentModel.findByIdAndUpdate(id, { $inc: { totalCoursesEnrolled: -1 } });
  }

  async markCourseCompleted(id: string): Promise<void> {
    await this.studentModel.findByIdAndUpdate(id, { $inc: { totalCoursesCompleted: 1 } });
  }
}
