import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseStatus } from './entities/course.entity';
import { Student } from '../students/entities/student.entity';
import { Instructor } from '../instructors/entities/instructor.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<Student>,
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<Instructor>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
  ) { }

  // CREATE
  async create(dto: CreateCourseDto): Promise<Course> {
    const course = new this.courseModel(dto);
    return course.save();
  }

  // READ ALL with filters
  async findAll(paginationDto: PaginationDto & { category?: string; level?: string; status?: string; instructorId?: string }) {
    const { page = 1, limit = 10, search, category, level, status, instructorId } = paginationDto;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (status) {
      filter.status = status;
    }

    if (instructorId) {
      filter.instructorId = instructorId;
    }

    const [courses, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .populate('instructorId', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.courseModel.countDocuments(filter),
    ]);

    return {
      data: courses,
      total,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // READ ONE
  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel
      .findById(id)
      .populate('instructorId', 'firstName lastName email bio')
      .exec();
    if (!course) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }
    return course;
  }

  // CLAIM — instructor claims an unassigned (instructorId: null) course
  async claimCourse(id: string, user: any): Promise<Course> {
    const course = await this.findOne(id);

    if (course.instructorId) {
      throw new BadRequestException(
        'This course already has an instructor assigned. Contact admin to reassign.',
      );
    }

    if (user.role !== 'instructor') {
      throw new BadRequestException('Only instructors can claim courses.');
    }

    (course as any).instructorId = user._id;
    return course.save();
  }

  // UPDATE
  async update(id: string, dto: UpdateCourseDto, user?: any): Promise<Course> {
    const course = await this.findOne(id);

    // Additional ownership check (guard already checked, but double-check)
    // if (user && user.role === 'instructor' && course.instructorId.toString() !== user._id.toString()) {
    //   throw new BadRequestException('You can only update your own courses');
    // }
    if (user && user.role === 'instructor') {
      if (!course.instructorId) {
        throw new BadRequestException('Course has no instructor assigned');
      }

      const instructorId =
        (course.instructorId as any)._id?.toString() ??
        course.instructorId.toString();

      if (instructorId !== user._id.toString()) {
        throw new BadRequestException(
          'You can only update your own courses',
        );
      }
    }

    Object.assign(course, dto);
    return course.save();
  }

  // PUBLISH / ARCHIVE
  async changeStatus(id: string, status: CourseStatus): Promise<Course> {
    const course = await this.findOne(id);

    if (status === CourseStatus.PUBLISHED) {
      // Basic validation before publishing
      if (!course.instructorId) {
        throw new BadRequestException('Course publish karne se pehle instructor assign karo');
      }
      if (course.totalLessons === 0) {
        throw new BadRequestException('Course mein kam se kam 1 lesson hona chahiye');
      }
    }

    course.status = status;
    return course.save();
  }

  // DELETE
  async remove(id: string): Promise<{ message: string }> {
    const course = await this.findOne(id);

    if (course.enrollmentCount > 0) {
      throw new BadRequestException(
        `Cannot delete course. ${course.enrollmentCount} student(s) enrolled. Archive it instead.`,
      );
    }

    await this.courseModel.findByIdAndDelete(id);
    return { message: 'Course deleted successfully' };
  }

  // Stats for dashboard
  async getStats(user?: any) {
    const filter: any = {};

    // If instructor, show only their stats
    if (user && user.role === 'instructor') {
      filter.instructorId = user._id?.toString() || user._id;
    }

    const total = await this.courseModel.countDocuments(filter);
    const published = await this.courseModel.countDocuments({ ...filter, status: CourseStatus.PUBLISHED });
    const draft = await this.courseModel.countDocuments({ ...filter, status: CourseStatus.DRAFT });

    const topCourses = await this.courseModel
      .find(filter)
      .populate('instructorId', 'firstName lastName')
      .sort({ enrollmentCount: -1 })
      .limit(5)
      .exec();

    return {
      total,
      published,
      draft,
      archived: total - published - draft,
      topCourses,
    };
  }

  // Admin dashboard stats
  async getAdminStats() {

    try {
      // Get total counts from all collections
      const [totalCourses, totalStudents, totalInstructors, totalEnrollments] = await Promise.all([
        this.courseModel.countDocuments(),
        this.studentModel.countDocuments(),
        this.instructorModel.countDocuments(),
        this.enrollmentModel.countDocuments(),
      ]);


      return {
        totalCourses,
        totalStudents,
        totalInstructors,
        totalEnrollments,
      };
    } catch (error) {
      console.error('❌ Error getting admin stats:', error);
      throw error;
    }
  }
}
