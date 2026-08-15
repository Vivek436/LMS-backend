import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Enrollment,
  EnrollmentStatus,
  PaymentStatus,
} from "./entities/enrollment.entity";
import {
  CreateEnrollmentDto,
  UpdateProgressDto,
  SubmitReviewDto,
  UpdatePaymentDto,
  UpdateEnrollmentStatusDto,
  UpdateEnrollmentDto,
} from "./dto/enrollment.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { StudentsService } from "../students/students.service";
import { CoursesService } from "../courses/courses.service";

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) { }

  // ENROLL a student in a course
  async create(dto: CreateEnrollmentDto): Promise<Enrollment> {
    // Student aur course exist karte hain?
    const student = await this.studentsService.findOne(dto.studentId);
    const course = await this.coursesService.findOne(dto.courseId);

    // Student active hai?
    if (student.status !== "active") {
      throw new BadRequestException(
        "Sirf active students hi enroll ho sakte hain",
      );
    }

    // Course published hai?
    if (course.status !== "published") {
      throw new BadRequestException(
        "Sirf published courses mein enrollment ho sakti hai",
      );
    }

    // Already enrolled?
    const existingEnrollment = await this.enrollmentModel.findOne({
      studentId: new Types.ObjectId(dto.studentId),
      courseId: new Types.ObjectId(dto.courseId),
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === EnrollmentStatus.DROPPED) {
        // Re-enroll karo
        existingEnrollment.status = EnrollmentStatus.ACTIVE;
        existingEnrollment.progressPercent = 0;
        existingEnrollment.lessonsCompleted = 0;
        existingEnrollment.droppedAt = null;
        if (dto.amountPaid) existingEnrollment.amountPaid = dto.amountPaid;
        if (dto.paymentStatus)
          existingEnrollment.paymentStatus = dto.paymentStatus;
        if (dto.paymentReference)
          existingEnrollment.paymentReference = dto.paymentReference;
        return existingEnrollment.save();
      }
      throw new ConflictException("Student already enrolled in this course");
    }

    // Enrollment create karo
    const enrollment = new this.enrollmentModel({
      ...dto,
      paymentDate: dto.paymentStatus === PaymentStatus.PAID ? new Date() : null,
    });

    const saved = await enrollment.save();

    // Student ka enrollment count badhao
    await this.studentsService.incrementEnrollment(dto.studentId);

    // Course ka enrollment count badhao
    await this.courseIncrementEnrollment(dto.courseId);

    return saved;
  }

  // Internal: course enrollment count badhao
  private async courseIncrementEnrollment(courseId: string): Promise<void> {
    await this.enrollmentModel.db
      .collection("courses")
      .updateOne({ _id: new Types.ObjectId(courseId) }, { $inc: { enrollmentCount: 1 } });
  }

  // READ ALL enrollments with filters
  async findAll(
    paginationDto: PaginationDto & {
      studentId?: string;
      courseId?: string;
      status?: string;
      paymentStatus?: string;
    },
  ) {
    const {
      page = 1,
      limit = 10,
      studentId,
      courseId,
      status,
      paymentStatus,
    } = paginationDto;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (studentId) {
      filter.studentId = new Types.ObjectId(studentId);
    }
    if (courseId) filter.courseId = new Types.ObjectId(courseId);
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const [enrollments, total] = await Promise.all([
      this.enrollmentModel
        .find(filter)
        .populate("studentId", "firstName lastName email")
        .populate({
          path: "courseId",
          select: "title description thumbnail price level category durationHours",
          populate: { path: "instructorId", select: "firstName lastName" },
        })
        .skip(skip)
        .limit(limit)
        .sort({ enrolledAt: -1 })
        .exec(),
      this.enrollmentModel.countDocuments(filter),
    ]);

    return {
      data: enrollments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // READ ONE
  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findById(id)
      .populate("studentId", "firstName lastName email")
      .populate({
        path: "courseId",
        populate: { path: "instructorId", select: "firstName lastName email" },
      })
      .exec();
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }
    return enrollment;
  }

  // GENERAL UPDATE (for edit page)
  async update(id: string, dto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    // Update fields if provided
    if (dto.status !== undefined) {
      enrollment.status = dto.status;
      if (dto.status === EnrollmentStatus.DROPPED) {
        enrollment.droppedAt = new Date();
      } else if (dto.status === EnrollmentStatus.COMPLETED) {
        enrollment.completedAt = new Date();
      }
    }

    if (dto.paymentStatus !== undefined) {
      enrollment.paymentStatus = dto.paymentStatus;
      if (dto.paymentStatus === PaymentStatus.PAID && !enrollment.paymentDate) {
        enrollment.paymentDate = new Date();
      }
    }

    if (dto.amountPaid !== undefined) {
      enrollment.amountPaid = dto.amountPaid;
    }

    if (dto.paymentReference !== undefined) {
      enrollment.paymentReference = dto.paymentReference;
    }

    if (dto.progressPercent !== undefined) {
      enrollment.progressPercent = dto.progressPercent;
    }

    if (dto.lessonsCompleted !== undefined) {
      enrollment.lessonsCompleted = dto.lessonsCompleted;
    }

    const updated = await enrollment.save();
    return updated;
  }

  // UPDATE PROGRESS — recalculates live from DB, does not trust frontend values
  async updateProgress(
    id: string,
    dto: UpdateProgressDto,
  ): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    // Allow progress update even for completed enrollments so that
    // adding new lessons correctly resets progress below 100%
    const db = this.enrollmentModel.db;
    const courseId = enrollment.courseId as any;
    const courseObjId = typeof courseId === 'string'
      ? new Types.ObjectId(courseId)
      : courseId;

    // Count total published lessons for this course
    const sections = await db.collection('sections').find({ courseId: courseObjId }).toArray();
    const sectionIds = sections.map((s: any) => s._id);
    const total = sectionIds.length > 0
      ? await db.collection('lessons').countDocuments({ sectionId: { $in: sectionIds } })
      : 0;

    // Count completed lessons for this enrollment
    const completedCount = await db.collection('lessonprogresses').countDocuments({
      enrollmentId: new Types.ObjectId(id),
      $or: [{ status: 'completed' }, { isCompleted: true }],
    });

    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    enrollment.progressPercent = percentage;
    enrollment.lessonsCompleted = completedCount;

    if (percentage === 100 && enrollment.status === EnrollmentStatus.ACTIVE) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
      await this.studentsService.markCourseCompleted(
        enrollment.studentId.toString(),
      );
    } else if (percentage < 100 && enrollment.status === EnrollmentStatus.COMPLETED) {
      // Instructor added new lessons — reopen the enrollment
      enrollment.status = EnrollmentStatus.ACTIVE;
      enrollment.completedAt = null;
    }

    return enrollment.save();
  }

  // SUBMIT REVIEW
  async submitReview(id: string, dto: SubmitReviewDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new BadRequestException(
        "Review sirf completed courses ke liye de sakte hain",
      );
    }

    if (enrollment.rating) {
      throw new ConflictException(
        "Aap pehle hi yeh course rate kar chuke hain",
      );
    }

    enrollment.rating = dto.rating;
    enrollment.review = dto.review;

    return enrollment.save();
  }

  // UPDATE PAYMENT
  async updatePayment(id: string, dto: UpdatePaymentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    enrollment.paymentStatus = dto.paymentStatus;
    if (dto.paymentReference)
      enrollment.paymentReference = dto.paymentReference;
    if (dto.amountPaid !== undefined) enrollment.amountPaid = dto.amountPaid;
    if (dto.paymentStatus === PaymentStatus.PAID) {
      enrollment.paymentDate = new Date();
    }

    return enrollment.save();
  }

  // UPDATE STATUS (drop/suspend)
  async updateStatus(
    id: string,
    dto: UpdateEnrollmentStatusDto,
  ): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException(
        "Completed enrollment ka status nahi badla ja sakta",
      );
    }

    const oldStatus = enrollment.status;
    enrollment.status = dto.status;

    if (dto.status === EnrollmentStatus.DROPPED) {
      enrollment.droppedAt = new Date();
      // Student count kam karo
      if (oldStatus === EnrollmentStatus.ACTIVE) {
        await this.studentsService.decrementEnrollment(
          enrollment.studentId.toString(),
        );
      }
    }

    return enrollment.save();
  }

  // ISSUE CERTIFICATE
  async issueCertificate(id: string): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new BadRequestException(
        "Certificate sirf completed course ke baad milega",
      );
    }

    if (enrollment.certificateUrl) {
      throw new ConflictException("Certificate pehle se issue ho chuka hai");
    }

    // In real app: PDF generate karo, S3 pe upload karo
    enrollment.certificateUrl = `https://lms.example.com/certificates/${enrollment.id}.pdf`;

    return enrollment.save();
  }

  // DELETE (hard delete - admin only)
  async remove(id: string): Promise<{ message: string }> {
    const enrollment = await this.findOne(id);
    await this.enrollmentModel.findByIdAndDelete(id);
    return { message: "Enrollment record deleted successfully" };
  }

  // STATS
  async getOverallStats() {
    const total = await this.enrollmentModel.countDocuments();
    const active = await this.enrollmentModel.countDocuments({
      status: EnrollmentStatus.ACTIVE,
    });
    const completed = await this.enrollmentModel.countDocuments({
      status: EnrollmentStatus.COMPLETED,
    });
    const dropped = await this.enrollmentModel.countDocuments({
      status: EnrollmentStatus.DROPPED,
    });

    const revenueResult = await this.enrollmentModel.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]);

    return {
      totalEnrollments: total,
      active,
      completed,
      dropped,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalRevenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
    };
  }
}
